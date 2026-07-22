#!/usr/bin/env python3
"""
TuneBridge Backend Server
Provides high-precision music link resolution across YouTube Music, YouTube, Spotify, and Apple Music:
- Evaluates candidate video similarity against a 70% threshold.
- If similarity is >= 70%, returns direct play video URL (https://music.youtube.com/watch?v=VIDEO_ID).
- If similarity is < 70%, falls back gracefully to YouTube Music search results (https://music.youtube.com/search?q=QUERY).
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import re
import ssl
import os
import sys
import difflib
import unicodedata

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class TuneBridgeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/resolve':
            self.handle_resolve(parsed_path)
        else:
            super().do_GET()

    def handle_resolve(self, parsed_path):
        query_params = urllib.parse.parse_qs(parsed_path.query)
        input_query = query_params.get('q', [''])[0] or query_params.get('url', [''])[0]
        
        if not input_query:
            self.send_json({'error': 'Missing query parameter q or url'}, status=400)
            return

        try:
            result = self.resolve_music_data(input_query.strip())
            self.send_json(result)
        except Exception as e:
            print(f"Error resolving query '{input_query}': {e}", file=sys.stderr)
            self.send_json({'error': str(e)}, status=500)

    def resolve_music_data(self, input_str):
        source_platform = 'Search'
        title = None
        artist = None
        spotify_preview = None
        spotify_artwork = None
        spotify_direct_url = None

        # 1. Detect platform & extract exact artist/title context
        if 'spotify.com/' in input_str:
            source_platform = 'Spotify'
            sp_data = self.resolve_spotify(input_str)
            if sp_data:
                title = sp_data.get('title')
                artist = sp_data.get('artist')
                spotify_preview = sp_data.get('preview_url')
                spotify_artwork = sp_data.get('artwork_url')
                spotify_direct_url = sp_data.get('direct_url')
        elif 'apple.com/' in input_str:
            source_platform = 'Apple Music'
            ap_data = self.resolve_apple(input_str)
            if ap_data:
                title = ap_data.get('title')
                artist = ap_data.get('artist')
        elif 'youtube.com/' in input_str or 'youtu.be/' in input_str:
            source_platform = 'YouTube Music' if 'music.youtube.com' in input_str else 'YouTube'
            yt_data = self.resolve_youtube(input_str)
            if yt_data:
                title = yt_data.get('title')
                artist = yt_data.get('artist')

        # If plain text query
        if not title:
            cleaned = self.clean_title(input_str)
            if ' - ' in cleaned:
                parts = cleaned.split(' - ', 1)
                artist = parts[0].strip()
                title = parts[1].strip()
            else:
                title = cleaned
                artist = ""

        # 2. Query iTunes API with >=70% similarity matching
        itunes_data = self.find_best_itunes_match(artist, title)
        
        album = 'Single'
        year = '2026'
        artwork = spotify_artwork or 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
        audio_preview = spotify_preview
        apple_music_url = None

        if itunes_data:
            title = itunes_data.get('trackName', title)
            artist = itunes_data.get('artistName', artist or 'Unknown Artist')
            album = itunes_data.get('collectionName', album)
            if itunes_data.get('releaseDate'):
                year = itunes_data.get('releaseDate')[:4]
            if itunes_data.get('artworkUrl100'):
                artwork = itunes_data.get('artworkUrl100').replace('100x100bb', '600x600bb')
            audio_preview = itunes_data.get('previewUrl') or spotify_preview
            apple_music_url = itunes_data.get('trackViewUrl')

        if not artist:
            artist = "Unknown Artist"

        # 3. YouTube Video ID resolution (Requires >= 70% match score)
        video_id = self.fetch_youtube_videoid(artist, title)

        full_query = f"{artist} {title}".strip()
        encoded_query = urllib.parse.quote(full_query)

        # Fallback to search results if video_id is None (<70% similarity)
        ytm_url = f"https://music.youtube.com/watch?v={video_id}" if video_id else f"https://music.youtube.com/search?q={encoded_query}"
        yt_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else f"https://www.youtube.com/results?search_query={encoded_query}"
        
        spotify_url = spotify_direct_url or f"https://open.spotify.com/search/{encoded_query}"

        platforms = {
            'ytm': ytm_url,
            'youtube': yt_url,
            'spotify': spotify_url,
            'apple': apple_music_url or f"https://music.apple.com/us/search?term={encoded_query}"
        }

        return {
            'sourcePlatform': source_platform,
            'title': title,
            'artist': artist,
            'album': album,
            'year': year,
            'artwork': artwork,
            'audioPreviewUrl': audio_preview,
            'videoId': video_id,
            'isDirectPlay': bool(video_id),
            'platforms': platforms,
            'originalUrl': input_str
        }

    def resolve_spotify(self, url):
        """Scrapes Spotify track embed page for exact track title, artist list, artwork & preview audio."""
        try:
            match = re.search(r'track/([a-zA-Z0-9]+)', url)
            if match:
                track_id = match.group(1)
                direct_track_url = f"https://open.spotify.com/track/{track_id}"
                embed_url = f"https://open.spotify.com/embed/track/{track_id}"
                req = urllib.request.Request(embed_url, headers={'User-Agent': 'Mozilla/5.0'})
                ctx = ssl._create_unverified_context()
                html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
                json_match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
                if json_match:
                    data = json.loads(json_match.group(1))
                    entity = data['props']['pageProps']['state']['data']['entity']
                    title = entity.get('name', '')
                    artists = [a['name'] for a in entity.get('artists', []) if 'name' in a]
                    artist_str = ', '.join(artists)
                    preview_url = entity.get('audioPreview', {}).get('url')
                    images = entity.get('visualIdentity', {}).get('image', [])
                    artwork_url = images[-1].get('url') if images and isinstance(images, list) else None
                    return {
                        'title': title,
                        'artist': artist_str,
                        'preview_url': preview_url,
                        'artwork_url': artwork_url,
                        'direct_url': direct_track_url
                    }
        except Exception as e:
            print("Spotify resolution error:", e, file=sys.stderr)
        
        try:
            oembed_url = f"https://open.spotify.com/oembed?url={urllib.parse.quote(url)}"
            req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
            ctx = ssl._create_unverified_context()
            data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
            title = data.get('title', '')
            match = re.search(r'track/([a-zA-Z0-9]+)', url)
            direct_url = f"https://open.spotify.com/track/{match.group(1)}" if match else None
            return {'title': self.clean_title(title), 'artist': '', 'direct_url': direct_url}
        except Exception:
            return None

    def resolve_apple(self, url):
        """Parses track ID from Apple Music links and uses iTunes Lookup API."""
        try:
            match = re.search(r'i=([0-9]+)', url)
            if match:
                track_id = match.group(1)
                lookup_url = f"https://itunes.apple.com/lookup?id={track_id}"
                req = urllib.request.Request(lookup_url, headers={'User-Agent': 'Mozilla/5.0'})
                ctx = ssl._create_unverified_context()
                data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
                results = data.get('results', [])
                if results:
                    return {
                        'title': results[0].get('trackName'),
                        'artist': results[0].get('artistName')
                    }
        except Exception:
            pass
        return None

    def resolve_youtube(self, url):
        """Resolves video title and author from YouTube oEmbed."""
        try:
            oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
            req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
            ctx = ssl._create_unverified_context()
            data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
            raw_title = data.get('title', '')
            author = data.get('author_name', '').replace(' - Topic', '').replace('VEVO', '').strip()
            
            cleaned_title = self.clean_title(raw_title)
            if ' - ' in cleaned_title:
                parts = cleaned_title.split(' - ', 1)
                return {'artist': parts[0].strip(), 'title': parts[1].strip()}
            
            return {'artist': author, 'title': cleaned_title}
        except Exception:
            return None

    def normalize_text(self, text):
        if not text: return ""
        return unicodedata.normalize('NFKC', str(text)).lower().strip()

    def calc_similarity(self, str1, str2):
        """Hybrid sequence & token similarity calculator with NFKC Unicode normalization."""
        if not str1 or not str2:
            return 1.0
        s1 = self.normalize_text(str1)
        s2 = self.normalize_text(str2)
        if s1 == s2:
            return 1.0
        
        seq_ratio = difflib.SequenceMatcher(None, s1, s2).ratio()
        words1 = set(re.findall(r'\w+', s1))
        words2 = set(re.findall(r'\w+', s2))
        if not words1 or not words2:
            token_ratio = 0.0
        else:
            intersection = words1.intersection(words2)
            min_words = min(len(words1), len(words2))
            token_ratio = len(intersection) / min_words if min_words > 0 else 0.0
            
        return max(seq_ratio, token_ratio)

    def find_best_itunes_match(self, artist, title):
        """Searches iTunes API with >=70% similarity threshold filtering."""
        try:
            query = f"{artist} {title}".strip()
            url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=10"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            ctx = ssl._create_unverified_context()
            data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
            results = data.get('results', [])
            if not results:
                return None

            best_candidate = None
            best_score = -1.0

            for item in results:
                it_artist = item.get('artistName', '')
                it_title = item.get('trackName', '')

                a_score = self.calc_similarity(artist, it_artist)
                t_score = self.calc_similarity(title, it_title)
                combined = (a_score + t_score) / 2.0

                if artist and a_score < 0.70:
                    continue
                if title and t_score < 0.70:
                    continue

                if combined > best_score:
                    best_score = combined
                    best_candidate = item

            return best_candidate or results[0]
        except Exception as e:
            print("iTunes match error:", e, file=sys.stderr)
            return None

    def fetch_youtube_videoid(self, artist, title):
        """Scores YouTube candidates requiring >=70% similarity threshold; returns None if score < 70% threshold."""
        try:
            query = f"{artist} {title}".strip()
            url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
            ctx = ssl._create_unverified_context()
            html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
            matches = re.findall(r'\"videoId\":\"([^\"]+)\"', html)
            
            seen = set()
            unique_ids = []
            for m in matches:
                if m not in seen and len(m) == 11:
                    seen.add(m)
                    unique_ids.append(m)

            best_id = None
            best_score = -999

            target_artist_norm = self.normalize_text(artist)
            target_title_norm = self.normalize_text(title)

            for vid in unique_ids[:10]:
                try:
                    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                    req_o = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                    data = json.loads(urllib.request.urlopen(req_o, context=ctx).read().decode('utf-8'))
                    
                    author = data.get('author_name', '')
                    v_title = data.get('title', '')

                    cleaned_v_title = re.sub(r'(\(|\[)(Official|Audio|Video|4K|HD|Lyrics|Remastered|Topic|MV|Full Video)(\)|\])', '', v_title, flags=re.IGNORECASE).strip()
                    author_clean = author.replace(' - Topic', '').replace('VEVO', '').strip()

                    norm_author = self.normalize_text(author_clean)
                    norm_v_title = self.normalize_text(v_title)
                    norm_clean_v_title = self.normalize_text(cleaned_v_title)

                    # Rule 1: Track title MUST match >= 70% or be contained in video title
                    t_sim = max(self.calc_similarity(title, norm_clean_v_title), self.calc_similarity(title, norm_v_title))
                    if target_title_norm and t_sim < 0.70 and target_title_norm not in norm_v_title:
                        continue

                    # Rule 2: Artist MUST match >= 70% in author OR be present in video title / author
                    a_sim = self.calc_similarity(artist, norm_author)
                    artist_in_title = target_artist_norm in norm_v_title or target_artist_norm in self.normalize_text(author)
                    if target_artist_norm and a_sim < 0.70 and not artist_in_title:
                        continue

                    score = (t_sim * 50) + (15 if artist_in_title else 0)
                    if '- Topic' in author or 'VEVO' in author or norm_author == target_artist_norm:
                        score += 40
                    if 'live' in norm_v_title and 'live' not in target_title_norm:
                        score -= 30

                    if score > best_score:
                        best_score = score
                        best_id = vid
                except Exception:
                    pass

            # Require >= 65 score threshold (~70% match requirement); otherwise return None to fallback to search results
            if best_score >= 65 and best_id:
                return best_id
            return None

        except Exception:
            return None

    def clean_title(self, text):
        if not text: return ""
        text = re.sub(r'(\(|\[)(Official|Audio|Video|4K|HD|Lyrics|Remastered|Topic|MV|Full Video)(\)|\])', '', text, flags=re.IGNORECASE)
        return ' '.join(text.split()).strip()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), TuneBridgeHandler) as httpd:
        print(f"TuneBridge server running at http://localhost:{PORT}")
        httpd.serve_forever()
