#!/usr/bin/env python3
"""
ToneTunnel Local Server & yt-dlp Download Engine
Enables direct, in-browser video & audio downloads using yt-dlp without
sending the user to any third-party websites or ad redirect chains.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
import tempfile
import re
import shutil
import subprocess

try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False

# Dependencies check
HAS_FFMPEG = shutil.which('ffmpeg') is not None
HAS_NODE = shutil.which('node') is not None

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(tempfile.gettempdir(), 'tonetunnel_cache')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def sanitize_filename(name):
    """Sanitize string to be safe for filesystem while preserving readability."""
    clean = re.sub(r'[\\/*?:"<>|]', '', name)
    clean = clean.strip()
    return clean[:120] if clean else 'download'

def format_duration(seconds):
    """Format seconds into HH:MM:SS or MM:SS."""
    if not seconds:
        return ""
    try:
        m, s = divmod(int(seconds), 60)
        h, m = divmod(m, 60)
        if h > 0:
            return f"{h}:{m:02d}:{s:02d}"
        return f"{m}:{s:02d}"
    except (ValueError, TypeError):
        return ""

def get_base_ydl_opts():
    """Base options for yt-dlp with node runtime support if available."""
    opts = {
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
    }
    if HAS_NODE:
        opts['js_runtimes'] = {'node': {}}
    return opts

class ToneTunnelHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_cors_headers()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_HEAD(self):
        """Handle HEAD requests."""
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ['/api/status', '/api/info', '/api/download']:
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
        else:
            super().do_HEAD()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == '/api/status':
            self.handle_status()
        elif parsed.path == '/api/info':
            self.handle_info(parsed)
        elif parsed.path == '/api/download':
            self.handle_download(parsed)
        else:
            super().do_GET()

    def send_cors_headers(self):
        """Attach universal CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization, X-Requested-With')
        self.send_header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type')

    def handle_status(self):
        """Health check endpoint to tell client yt-dlp is available."""
        self.send_json({
            'status': 'ok',
            'has_ytdlp': HAS_YTDLP,
            'version': yt_dlp.version.__version__ if HAS_YTDLP else None,
            'has_ffmpeg': HAS_FFMPEG,
            'has_node': HAS_NODE
        })

    def handle_info(self, parsed):
        """Extract video metadata and available qualities using yt-dlp."""
        query = urllib.parse.parse_qs(parsed.query)
        video_url = query.get('url', [''])[0].strip()

        if not video_url:
            self.send_json({'error': 'Missing url parameter'}, status=400)
            return

        if not HAS_YTDLP:
            self.send_json({'error': 'yt-dlp is not installed on the server. Run: pip install yt-dlp'}, status=500)
            return

        try:
            ydl_opts = get_base_ydl_opts()
            ydl_opts.update({
                'skip_download': True,
                'extract_flat': False,
                'socket_timeout': 15,
            })

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)

            if not info:
                self.send_json({'error': 'Could not extract video details from this URL.'}, status=404)
                return

            title = info.get('title', 'Unknown Title')
            author = info.get('uploader') or info.get('channel') or info.get('creator') or 'Creator'
            thumbnail = info.get('thumbnail') or ''
            duration = format_duration(info.get('duration'))
            platform = info.get('extractor_key') or 'Video'

            # Inspect available resolutions
            formats = info.get('formats') or []
            heights = set()
            for f in formats:
                h = f.get('height')
                if h and isinstance(h, int) and h >= 144:
                    heights.add(h)

            sorted_heights = sorted(list(heights), reverse=True)
            if not sorted_heights:
                sorted_heights = [1080, 720, 480, 360]

            self.send_json({
                'title': title,
                'author': author,
                'thumbnail': thumbnail,
                'duration': duration,
                'platform': platform,
                'url': video_url,
                'available_heights': sorted_heights,
                'has_ytdlp': True
            })

        except Exception as e:
            print(f"[ToneTunnel] Info extraction error: {e}", file=sys.stderr)
            self.send_json({'error': f"Failed to retrieve video details: {str(e)}"}, status=500)

    def handle_download(self, parsed):
        """Download video/audio with selected settings and stream directly as file attachment."""
        query = urllib.parse.parse_qs(parsed.query)
        video_url = query.get('url', [''])[0].strip()
        media_type = query.get('type', ['video'])[0].lower() # 'video' or 'audio'
        quality = query.get('quality', ['max'])[0]

        if not video_url:
            self.send_json({'error': 'Missing url parameter'}, status=400)
            return

        if not HAS_YTDLP:
            self.send_json({'error': 'yt-dlp is not installed on the server. Run: pip install yt-dlp'}, status=500)
            return

        temp_job_id = tempfile.mktemp(dir=DOWNLOAD_DIR, prefix='job_')
        outtmpl = f"{temp_job_id}.%(ext)s"

        expected_file = None
        try:
            ydl_opts = get_base_ydl_opts()
            ydl_opts.update({
                'outtmpl': outtmpl,
                'socket_timeout': 30,
            })

            if media_type == 'audio':
                # Audio extraction
                bitrate = quality if quality in ['320', '256', '128'] else '320'
                if HAS_FFMPEG:
                    ydl_opts.update({
                        'format': 'bestaudio/best',
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': bitrate,
                        }]
                    })
                else:
                    ydl_opts['format'] = 'bestaudio/best'
            else:
                # Video extraction with selected max resolution and resilient fallback
                if quality in ['1080', '720', '480', '360']:
                    h = int(quality)
                    ydl_opts['format'] = f'bestvideo[height<={h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<={h}]+bestaudio/best[height<={h}]/bestvideo+bestaudio/best'
                else:
                    ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'
                
                # Merge into mp4 container if ffmpeg is available
                if HAS_FFMPEG:
                    ydl_opts['merge_output_format'] = 'mp4'

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                raw_title = info.get('title', 'media')
                title = sanitize_filename(raw_title)

            # Locate the generated output file
            target_ext = 'mp3' if (media_type == 'audio' and HAS_FFMPEG) else 'mp4'
            candidate_file = f"{temp_job_id}.{target_ext}"

            if os.path.exists(candidate_file):
                expected_file = candidate_file
            else:
                # Find matching file with any extension created by this job
                matching = [
                    os.path.join(DOWNLOAD_DIR, f)
                    for f in os.listdir(DOWNLOAD_DIR)
                    if f.startswith(os.path.basename(temp_job_id)) and not f.endswith('.part') and not f.endswith('.ytdl')
                ]
                if matching:
                    expected_file = matching[0]
                    target_ext = expected_file.split('.')[-1].lower()

            if not expected_file or not os.path.exists(expected_file):
                self.send_json({'error': 'Output file was not generated by downloader engine.'}, status=500)
                return

            file_size = os.path.getsize(expected_file)
            content_type = 'audio/mpeg' if target_ext == 'mp3' else f'video/{target_ext}'
            download_filename = f"{title}.{target_ext}"

            # Safely encode filename for Content-Disposition header (RFC 5987 + ASCII fallback)
            # This prevents UnicodeEncodeError with Turkish, Cyrillic, or emoji characters!
            ascii_safe_filename = re.sub(r'[^\w\s.-]', '_', download_filename).strip() or f"media.{target_ext}"
            encoded_filename = urllib.parse.quote(download_filename.encode('utf-8'))

            # Stream directly to browser
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header(
                'Content-Disposition',
                f'attachment; filename="{ascii_safe_filename}"; filename*=UTF-8\'\'{encoded_filename}'
            )
            self.end_headers()

            with open(expected_file, 'rb') as f:
                shutil.copyfileobj(f, self.wfile, length=64 * 1024)

        except Exception as e:
            print(f"[ToneTunnel] Download execution error: {e}", file=sys.stderr)
            self.send_json({'error': f"Download failed: {str(e)}"}, status=500)

        finally:
            # Clean up all temp files for this job
            base_job_name = os.path.basename(temp_job_id)
            for f in os.listdir(DOWNLOAD_DIR):
                if f.startswith(base_job_name):
                    try:
                        os.remove(os.path.join(DOWNLOAD_DIR, f))
                    except Exception:
                        pass

    def send_json(self, data, status=200):
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        try:
            self.wfile.write(response_bytes)
        except (BrokenPipeError, ConnectionResetError):
            pass

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

def run():
    print("=" * 64)
    print("🚀 ToneTunnel Local Server & yt-dlp Engine")
    print(f"🌐 Running at: http://localhost:{PORT}")
    print(f"📦 yt-dlp:    {'Enabled (v' + yt_dlp.version.__version__ + ')' if HAS_YTDLP else '❌ NOT INSTALLED (run: pip install yt-dlp)'}")
    print(f"🎬 FFmpeg:    {'Detected' if HAS_FFMPEG else '⚠️ Not found in PATH (needed for MP3 audio conversion & muxing)'}")
    print(f"⚡ JS Runtime:{'Node.js detected' if HAS_NODE else '⚠️ Node not found (recommended for modern YouTube signatures)'}")
    print("=" * 64)
    print("Open ToneTunnel in your browser: http://localhost:8080/index.html")
    print("Press Ctrl+C to stop.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with ThreadingTCPServer(("", PORT), ToneTunnelHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run()

