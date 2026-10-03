#!/usr/bin/env python3
"""
ToneTunnel Local Server & yt-dlp Download Engine
Enables direct, in-browser video & audio downloads using yt-dlp without
sending the user to any third-party websites.
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

try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(tempfile.gettempdir(), 'tonetunnel_cache')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def sanitize_filename(name):
    """Sanitize string to be safe for filesystem and Content-Disposition header."""
    clean = re.sub(r'[\\/*?:"<>|]', '', name)
    clean = clean.strip()
    return clean[:120] if clean else 'download'

def format_duration(seconds):
    """Format seconds into HH:MM:SS or MM:SS."""
    if not seconds:
        return ""
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

class ToneTunnelHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

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

    def handle_status(self):
        """Health check endpoint to tell client yt-dlp is available."""
        self.send_json({
            'status': 'ok',
            'has_ytdlp': HAS_YTDLP,
            'version': yt_dlp.version.__version__ if HAS_YTDLP else None
        })

    def handle_info(self, parsed):
        """Extract video metadata and available qualities using yt-dlp."""
        query = urllib.parse.parse_qs(parsed.query)
        video_url = query.get('url', [''])[0].strip()

        if not video_url:
            self.send_json({'error': 'Missing url parameter'}, status=400)
            return

        if not HAS_YTDLP:
            self.send_json({'error': 'yt-dlp is not installed on the server'}, status=500)
            return

        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'extract_flat': False
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)

            if not info:
                self.send_json({'error': 'Could not extract video details'}, status=404)
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
            self.send_json({'error': str(e)}, status=500)

    def handle_download(self, parsed):
        """Download video/audio with selected settings and stream directly as file attachment."""
        query = urllib.parse.parse_qs(parsed.query)
        video_url = query.get('url', [''])[0].strip()
        media_type = query.get('type', ['video'])[0].lower() # 'video' or 'audio'
        quality = query.get('quality', ['1080'])[0]

        if not video_url:
            self.send_json({'error': 'Missing url parameter'}, status=400)
            return

        if not HAS_YTDLP:
            self.send_json({'error': 'yt-dlp is not installed on the server'}, status=500)
            return

        temp_job_id = tempfile.mktemp(dir=DOWNLOAD_DIR, prefix='job_')
        outtmpl = f"{temp_job_id}.%(ext)s"

        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'outtmpl': outtmpl,
                'nocheckcertificate': True
            }

            if media_type == 'audio':
                # Audio extraction (MP3 / 320k or chosen bitrate)
                bitrate = quality if quality in ['320', '256', '128'] else '320'
                ydl_opts.update({
                    'format': 'bestaudio/best',
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': bitrate,
                    }]
                })
            else:
                # Video extraction with selected max resolution
                if quality in ['1080', '720', '480', '360']:
                    h = int(quality)
                    ydl_opts['format'] = f'bestvideo[height<={h}]+bestaudio/best[height<={h}]/best'
                else:
                    ydl_opts['format'] = 'bestvideo+bestaudio/best'
                
                # Merge into mp4 container
                ydl_opts['merge_output_format'] = 'mp4'

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                title = sanitize_filename(info.get('title', 'media'))

            # Locate the generated output file
            target_ext = 'mp3' if media_type == 'audio' else 'mp4'
            expected_file = f"{temp_job_id}.{target_ext}"

            # If extension differed (e.g. m4a or webm), find the actual file created
            if not os.path.exists(expected_file):
                matching = [os.path.join(DOWNLOAD_DIR, f) for f in os.listdir(DOWNLOAD_DIR) if f.startswith(os.path.basename(temp_job_id))]
                if matching:
                    expected_file = matching[0]
                    target_ext = expected_file.split('.')[-1]

            if not os.path.exists(expected_file):
                self.send_json({'error': 'Output file was not generated.'}, status=500)
                return

            file_size = os.path.getsize(expected_file)
            content_type = 'audio/mpeg' if target_ext == 'mp3' else 'video/mp4'
            download_filename = f"{title}.{target_ext}"

            # Stream directly to browser
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Content-Disposition', f'attachment; filename="{download_filename}"')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            with open(expected_file, 'rb') as f:
                shutil.copyfileobj(f, self.wfile, length=64 * 1024)

            # Cleanup temp file
            try:
                os.remove(expected_file)
            except Exception:
                pass

        except Exception as e:
            print(f"[ToneTunnel] Download execution error: {e}", file=sys.stderr)
            self.send_json({'error': f"Download failed: {str(e)}"}, status=500)
            # Cleanup any remaining job files
            for f in os.listdir(DOWNLOAD_DIR):
                if f.startswith(os.path.basename(temp_job_id)):
                    try:
                        os.remove(os.path.join(DOWNLOAD_DIR, f))
                    except Exception:
                        pass

    def send_json(self, data, status=200):
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

def run():
    with socketserver.TCPServer(("", PORT), ToneTunnelHandler) as httpd:
        print("=" * 60)
        print(f"🚀 ToneTunnel yt-dlp Download Server Active")
        print(f"🌐 Running at: http://localhost:{PORT}")
        print(f"📦 yt-dlp Engine: {'Enabled (v' + yt_dlp.version.__version__ + ')' if HAS_YTDLP else 'Disabled'}")
        print("=" * 60)
        print("Downloads will be saved directly through the browser without redirects.")
        print("Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run()
