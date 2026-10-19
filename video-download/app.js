/**
 * ToneTunnel — Universal Web Video & Audio Downloader Engine
 * Powered by yt-dlp local server & direct client-side stream resolution.
 * Downloads video and audio directly in the user's browser without external redirects.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Platform Definitions & Icons
    const PLATFORMS = {
        youtube: {
            name: 'YouTube',
            pattern: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
            color: '#ff0000',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
        },
        tiktok: {
            name: 'TikTok',
            pattern: /tiktok\.com\/(?:@[\w.-]+\/video\/\d+|v\/\d+|t\/[\w.-]+)/i,
            color: '#00f2fe',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
        },
        instagram: {
            name: 'Instagram',
            pattern: /instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i,
            color: '#e1306c',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
        },
        twitter: {
            name: 'Twitter / X',
            pattern: /(?:twitter\.com|x\.com)\/(?:[\w.-]+)\/status\/(\d+)/i,
            color: '#1da1f2',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
        },
        reddit: {
            name: 'Reddit',
            pattern: /reddit\.com\/r\/[\w.-]+\/comments\/[\w.-]+/i,
            color: '#ff4500',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M8 11.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" fill="#041324"/><path d="M9 16c1.5 1 4.5 1 6 0" stroke="#041324" stroke-width="2" stroke-linecap="round"/></svg>`
        },
        vimeo: {
            name: 'Vimeo',
            pattern: /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i,
            color: '#1ab7ea',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.84 8.04c-.1 2.37-1.74 5.62-4.91 9.75-3.29 4.31-6.07 6.47-8.36 6.47-1.42 0-2.62-1.32-3.6-3.95l-1.96-7.2c-.73-2.67-1.52-4-2.38-4-.18 0-.82.38-1.92 1.15L0 8.65c1.47-1.28 2.92-2.58 4.34-3.89 1.95-1.68 3.4-2.58 4.36-2.69 2.27-.22 3.67 1.33 4.2 4.65.64 3.99 1.08 6.48 1.33 7.48.74 3.25 1.56 4.88 2.45 4.88.7 0 1.57-1.12 2.62-3.37 1.05-2.25 1.62-3.95 1.7-5.1.18-2-1.07-3.04-3.75-3.12 1.34-4.32 3.89-6.41 7.65-6.27 2.78.11 4.09 1.83 3.94 5.16z"/></svg>`
        },
        generic: {
            name: 'Video Link',
            pattern: /^https?:\/\/.+/i,
            color: '#38bdf8',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`
        }
    };

    // Environment & Shared Helpers
    // GitHub Pages is static hosting: no Python backend can run there, so we use
    // public CORS-enabled APIs ("Browser Mode") and only probe localhost once.
    const IS_GITHUB_PAGES = /\.github\.io$/i.test(window.location.hostname);
    const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';

    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Keeps Unicode (Turkish, Cyrillic, emoji...) and strips only characters illegal in filenames
    const safeFilename = (name) => String(name || '')
        .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100) || 'media';

    const formatSeconds = (sec) => {
        const total = Math.round(Number(sec) || 0);
        if (!total) return '';
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    };

    const fetchJson = async (url, timeoutMs = 12000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`Service responded with HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            if (err.name === 'AbortError') throw new Error('The download service took too long to respond. Please try again.');
            throw err;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    // State Variables
    let hasLocalBackend = false;
    let apiBase = ''; // Base URL for local server (e.g. 'http://127.0.0.1:8080' or window.location.origin)
    let serverEngineInfo = null;
    let selectedType = 'video'; // 'video' or 'audio'
    let currentVideoData = null;
    let downloadHistory = [];

    try {
        downloadHistory = JSON.parse(localStorage.getItem('tonetunnel_downloads') || '[]');
        if (!Array.isArray(downloadHistory)) downloadHistory = [];
    } catch (e) {
        downloadHistory = [];
    }

    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const downloadForm = document.getElementById('downloadForm');
    const fetchBtn = document.getElementById('fetchBtn');
    const fetchBtnText = document.getElementById('fetchBtnText');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const platformIndicator = document.getElementById('platformIndicator');
    const qualitySelect = document.getElementById('qualitySelect');
    const formatTabs = document.querySelectorAll('.format-tab');

    // Header & Status Elements
    const engineStatusBtn = document.getElementById('engineStatusBtn');
    const headerStatusDot = document.getElementById('headerStatusDot');
    const headerStatusText = document.getElementById('headerStatusText');
    const heroStatusBadge = document.getElementById('heroStatusBadge');
    const heroPulseDot = document.getElementById('heroPulseDot');
    const heroBadgeText = document.getElementById('heroBadgeText');

    // States & Results
    const loadingState = document.getElementById('loadingState');
    const loadingText = document.getElementById('loadingText');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
    const engineHelpBtn = document.getElementById('engineHelpBtn');
    const fallbackExternalLink = document.getElementById('fallbackExternalLink');
    const resultSection = document.getElementById('resultSection');

    // Video Card Elements
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');
    const videoDuration = document.getElementById('videoDuration');
    const resultPlatformBadge = document.getElementById('resultPlatformBadge');
    const mediaTypeBadge = document.getElementById('mediaTypeBadge');
    const mediaQualityBadge = document.getElementById('mediaQualityBadge');
    const primaryDownloadBtn = document.getElementById('primaryDownloadBtn');
    const primaryDownloadText = document.getElementById('primaryDownloadText');
    const additionalDownloads = document.getElementById('additionalDownloads');
    const copyStreamLinkBtn = document.getElementById('copyStreamLinkBtn');
    const showQrBtn = document.getElementById('showQrBtn');
    const openSourceBtn = document.getElementById('openSourceBtn');
    const playPreviewBtn = document.getElementById('playPreviewBtn');

    // History & Modals
    const historyBtn = document.getElementById('historyBtn');
    const historyCount = document.getElementById('historyCount');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const qrModal = document.getElementById('qrModal');
    const closeQrModalBtn = document.getElementById('closeQrModalBtn');
    const qrCodeTarget = document.getElementById('qrCodeTarget');
    const qrLinkText = document.getElementById('qrLinkText');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModalBtn = document.getElementById('closePreviewModalBtn');
    const previewMediaContainer = document.getElementById('previewMediaContainer');
    const previewModalTitle = document.getElementById('previewModalTitle');
    const appToast = document.getElementById('appToast');

    // Engine Setup Modal Elements
    const engineModal = document.getElementById('engineModal');
    const closeEngineModalBtn = document.getElementById('closeEngineModalBtn');
    const dismissEngineModalBtn = document.getElementById('dismissEngineModalBtn');
    const modalStatusDot = document.getElementById('modalStatusDot');
    const modalStatusText = document.getElementById('modalStatusText');
    const testEngineBtn = document.getElementById('testEngineBtn');
    const copyServerCmdBtn = document.getElementById('copyServerCmdBtn');
    const serverCmdText = document.getElementById('serverCmdText');

    // 1. Intelligent Server Auto-Discovery
    // Checks relative path first, then direct 127.0.0.1:8080 and localhost:8080
    const checkServerStatus = async (notify = false) => {
        const candidateHosts = [];

        // If page is served over http/https by server.py, try same origin first
        // (skipped on GitHub Pages, which can never host the API)
        if (window.location.protocol.startsWith('http') && !IS_GITHUB_PAGES) {
            candidateHosts.push(window.location.origin);
        }
        candidateHosts.push('http://127.0.0.1:8080');
        candidateHosts.push('http://localhost:8080');

        let found = false;

        for (const host of candidateHosts) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const res = await fetch(`${host}/api/status`, {
                    method: 'GET',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.status === 'ok') {
                        hasLocalBackend = true;
                        apiBase = host;
                        serverEngineInfo = data;
                        found = true;
                        updateEngineStatusUI(true, data);
                        if (notify) {
                            showToast('🚀 Connected to local yt-dlp download engine!');
                        }
                        break;
                    }
                }
            } catch (e) {
                // Try next host
            }
        }

        if (!found) {
            hasLocalBackend = false;
            apiBase = '';
            serverEngineInfo = null;
            updateEngineStatusUI(false);
            if (notify) {
                showToast('ℹ️ Local engine not found — Browser Mode is active (TikTok, X & Reddit).');
            }
        }

        return found;
    };

    const updateEngineStatusUI = (isOnline, info = null) => {
        if (isOnline) {
            const verText = info && info.version ? `v${info.version}` : 'Active';
            if (headerStatusDot) {
                headerStatusDot.className = 'status-indicator-dot online';
            }
            if (headerStatusText) {
                headerStatusText.textContent = 'Engine Online';
            }
            if (heroPulseDot) {
                heroPulseDot.style.backgroundColor = '#10b981';
                heroPulseDot.style.boxShadow = '0 0 8px #10b981';
            }
            if (heroBadgeText) {
                heroBadgeText.textContent = `yt-dlp Engine Active (${verText}) · Direct Downloads`;
            }
            if (modalStatusDot) {
                modalStatusDot.className = 'status-indicator-dot online';
            }
            if (modalStatusText) {
                modalStatusText.textContent = `Engine Active · yt-dlp ${verText} (FFmpeg & Node Ready)`;
            }
        } else {
            // No local engine: fall back to serverless Browser Mode
            if (headerStatusDot) {
                headerStatusDot.className = 'status-indicator-dot browser';
            }
            if (headerStatusText) {
                headerStatusText.textContent = 'Browser Mode';
            }
            if (heroPulseDot) {
                heroPulseDot.style.backgroundColor = '#38bdf8';
                heroPulseDot.style.boxShadow = '0 0 8px #38bdf8';
            }
            if (heroBadgeText) {
                heroBadgeText.textContent = 'Browser Mode · TikTok, X & Reddit download instantly';
            }
            if (modalStatusDot) {
                modalStatusDot.className = 'status-indicator-dot browser';
            }
            if (modalStatusText) {
                modalStatusText.textContent = 'Browser Mode active · Local engine not detected (optional)';
            }
        }
    };

    // Initial check. Periodic heartbeat only when running locally — on GitHub Pages
    // repeatedly probing localhost would just spam the console with failed requests.
    checkServerStatus();
    if (!IS_GITHUB_PAGES) {
        setInterval(() => {
            if (!hasLocalBackend) {
                checkServerStatus(false);
            }
        }, 6000);
    }

    // 2. Detect Platform from URL
    const detectPlatform = (url) => {
        if (!url || typeof url !== 'string') return PLATFORMS.generic;
        for (const [key, plat] of Object.entries(PLATFORMS)) {
            if (key === 'generic') continue;
            if (plat.pattern.test(url)) return plat;
        }
        return PLATFORMS.generic;
    };

    const updatePlatformIcon = () => {
        const url = urlInput.value.trim();
        const platform = detectPlatform(url);
        platformIndicator.innerHTML = platform.icon;
        platformIndicator.style.color = platform.color;
        clearBtn.style.display = url.length > 0 ? 'inline-flex' : 'none';
    };

    urlInput.addEventListener('input', updatePlatformIcon);

    // 3. Format Tabs (Video vs Audio Only)
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formatTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            selectedType = tab.getAttribute('data-type');

            if (selectedType === 'audio') {
                qualitySelect.innerHTML = `
                    <option value="320" selected>MP3 Best (320 kbps)</option>
                    <option value="256">MP3 High (256 kbps)</option>
                    <option value="128">MP3 Standard (128 kbps)</option>
                `;
            } else {
                qualitySelect.innerHTML = `
                    <option value="max" selected>Best Available (1080p/4K)</option>
                    <option value="1080">1080p Full HD</option>
                    <option value="720">720p HD</option>
                    <option value="480">480p SD</option>
                    <option value="360">360p</option>
                `;
            }

            if (currentVideoData && urlInput.value.trim()) {
                fetchMediaStreams(urlInput.value.trim());
            }
        });
    });

    // 4. Paste and Clear Buttons
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text.trim();
                updatePlatformIcon();
                showToast('Pasted link from clipboard');
                fetchMediaStreams(urlInput.value);
            }
        } catch (err) {
            urlInput.focus();
            showToast('Please paste the URL manually (Ctrl+V)');
        }
    });

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        updatePlatformIcon();
        hideAllStates();
        urlInput.focus();
    });

    // 5. Fetch Video Info
    const fetchVideoInfo = async (url) => {
        // If local yt-dlp backend is active, use it for accurate metadata
        if (hasLocalBackend && apiBase) {
            try {
                const res = await fetch(`${apiBase}/api/info?url=${encodeURIComponent(url)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && !data.error) {
                        return {
                            title: data.title,
                            author: data.author,
                            thumbnail: data.thumbnail || FALLBACK_THUMB,
                            duration: data.duration,
                            platform: data.platform,
                            sourceUrl: url,
                            availableHeights: data.available_heights || [1080, 720, 480, 360],
                            hasLocalBackend: true
                        };
                    }
                }
            } catch (err) {
                console.warn('Local yt-dlp info failed:', err);
            }
        }

        // Generic OEmbed / YouTube thumbnail extraction
        let detectedTitle = 'Media Ready to Download';
        let detectedAuthor = detectPlatform(url).name;
        let detectedThumb = FALLBACK_THUMB;

        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        if (ytMatch && ytMatch[1]) {
            detectedThumb = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }

        try {
            const noembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            if (noembedRes.ok) {
                const data = await noembedRes.json();
                if (data && data.title) {
                    detectedTitle = data.title;
                    detectedAuthor = data.author_name || detectedAuthor;
                    if (data.thumbnail_url) detectedThumb = data.thumbnail_url;
                }
            }
        } catch (e) {
            // Ignore oembed failure
        }

        return {
            title: detectedTitle,
            author: detectedAuthor,
            thumbnail: detectedThumb,
            duration: '',
            platform: detectPlatform(url).name,
            sourceUrl: url,
            availableHeights: [1080, 720, 480, 360]
        };
    };

    // 5b. Browser Mode Resolvers (serverless — works on GitHub Pages)
    // Each resolver returns { title, author, thumbnail, duration, platform, options[] }
    // where options are sorted best-first: { label, quality, url, kind: 'video'|'audio', ext, height }

    // TikTok → TikWM public API (CORS-enabled, watermark-free streams)
    const resolveTikTok = async (url) => {
        const json = await fetchJson(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
        if (!json || json.code !== 0 || !json.data) {
            throw new Error((json && json.msg) || 'TikTok video not found. Make sure the link is public.');
        }
        const d = json.data;
        const abs = (u) => (u && u.startsWith('/') ? `https://www.tikwm.com${u}` : u);
        const options = [];
        if (d.hdplay) options.push({ label: 'HD MP4 (No Watermark)', quality: 'HD', url: abs(d.hdplay), kind: 'video', ext: 'mp4', height: 1080 });
        if (d.play) options.push({ label: 'MP4 (No Watermark)', quality: 'SD', url: abs(d.play), kind: 'video', ext: 'mp4', height: 720 });
        if (d.wmplay) options.push({ label: 'MP4 (Watermarked)', quality: 'WM', url: abs(d.wmplay), kind: 'video', ext: 'mp4', height: 720 });
        if (d.music) options.push({ label: 'Original Sound (MP3)', quality: 'Audio', url: abs(d.music), kind: 'audio', ext: 'mp3' });

        return {
            title: d.title || 'TikTok Video',
            author: (d.author && (d.author.nickname || d.author.unique_id)) || 'TikTok Creator',
            thumbnail: abs(d.origin_cover || d.cover),
            duration: formatSeconds(d.duration),
            platform: 'TikTok',
            options
        };
    };

    // Twitter / X → FxTwitter public API (CORS-enabled, direct MP4 variants)
    const resolveTwitter = async (url) => {
        const match = url.match(/(?:twitter\.com|x\.com)\/(?:[\w.-]+|i(?:\/web)?)\/status(?:es)?\/(\d+)/i);
        if (!match) throw new Error('Could not find a post ID in this X/Twitter link.');

        const json = await fetchJson(`https://api.fxtwitter.com/status/${match[1]}`);
        if (!json || json.code !== 200 || !json.tweet) {
            throw new Error((json && json.message) || 'Post not found. It may be private, deleted, or age-restricted.');
        }
        const t = json.tweet;
        const media = t.media || {};
        const videos = media.videos || (media.all || []).filter(m => m.type === 'video' || m.type === 'gif');
        if (!videos.length) throw new Error('This post does not contain a video.');

        const options = [];
        const seen = new Set();
        videos.forEach((v, idx) => {
            const prefix = videos.length > 1 ? `#${idx + 1} · ` : '';
            const variants = (v.formats || v.variants || [])
                .filter(f => f.url && (f.container === 'mp4' || f.content_type === 'video/mp4' || /\.mp4(\?|$)/i.test(f.url)))
                .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            if (!variants.length && v.url) variants.push({ url: v.url });

            variants.forEach(f => {
                if (seen.has(f.url)) return;
                seen.add(f.url);
                const dims = f.url.match(/\/(\d{2,4})x(\d{2,4})\//);
                const h = dims ? Math.min(+dims[1], +dims[2]) : (v.width && v.height ? Math.min(v.width, v.height) : 0);
                options.push({
                    label: `${prefix}${h ? `${h}p ` : ''}MP4`,
                    quality: h ? `${h}p` : 'MP4',
                    url: f.url,
                    kind: 'video',
                    ext: 'mp4',
                    height: h
                });
            });
        });

        const text = (t.text || '').replace(/https?:\/\/\S+/g, '').trim();
        const author = t.author ? `${t.author.name} (@${t.author.screen_name})` : 'X User';
        return {
            title: text ? (text.length > 90 ? `${text.slice(0, 90)}…` : text) : `Video by ${author}`,
            author,
            thumbnail: videos[0].thumbnail_url,
            duration: formatSeconds(videos[0].duration),
            platform: 'Twitter / X',
            options
        };
    };

    // Reddit → public .json endpoint (Reddit-hosted v.redd.it videos)
    const resolveReddit = async (url) => {
        if (/reddit\.com\/r\/[\w.-]+\/s\//i.test(url)) {
            throw new Error('Reddit share links (/s/...) can\'t be resolved in the browser. Open the post and copy the full URL from the address bar.');
        }
        let clean = url.split('#')[0].split('?')[0]
            .replace(/^https?:\/\/(?:old\.|new\.|m\.|np\.)?reddit\.com/i, 'https://www.reddit.com')
            .replace(/\/+$/, '');

        const json = await fetchJson(`${clean}.json?raw_json=1`);
        const post = json && json[0] && json[0].data && json[0].data.children[0] && json[0].data.children[0].data;
        if (!post) throw new Error('Reddit post not found.');

        const src = (post.crosspost_parent_list && post.crosspost_parent_list[0]) || post;
        const rv = (src.secure_media && src.secure_media.reddit_video)
            || (src.media && src.media.reddit_video)
            || (src.preview && src.preview.reddit_video_preview);
        if (!rv || !rv.fallback_url) {
            throw new Error('This Reddit post does not contain a Reddit-hosted video.');
        }

        const videoUrl = rv.fallback_url.split('?')[0];
        const base = videoUrl.replace(/\/[^/]+$/, '');
        const h = Math.min(rv.width || 0, rv.height || 0) || rv.height || 0;
        const options = [
            { label: `${h ? `${h}p ` : ''}MP4 (video track, no sound)`, quality: h ? `${h}p` : 'MP4', url: videoUrl, kind: 'video', ext: 'mp4', height: h },
            { label: 'Audio Track (M4A)', quality: 'Audio', url: `${base}/DASH_AUDIO_128.mp4`, kind: 'audio', ext: 'm4a' }
        ];

        let thumb = '';
        try { thumb = post.preview.images[0].source.url; } catch (e) { /* no preview */ }
        if (!thumb && /^https?:/.test(post.thumbnail || '')) thumb = post.thumbnail;

        return {
            title: post.title || 'Reddit Video',
            author: `u/${post.author} · r/${post.subreddit}`,
            thumbnail: thumb,
            duration: formatSeconds(rv.duration),
            platform: 'Reddit',
            options
        };
    };

    const BROWSER_RESOLVERS = {
        'TikTok': resolveTikTok,
        'Twitter / X': resolveTwitter,
        'Reddit': resolveReddit
    };

    const getBrowserResolver = (url) => BROWSER_RESOLVERS[detectPlatform(url).name] || null;

    // Choose the best option matching the selected format tab and quality cap
    const pickPrimaryOption = (options, isAudio, quality) => {
        const videos = options.filter(o => o.kind === 'video');
        const audios = options.filter(o => o.kind === 'audio');
        if (isAudio) {
            if (audios.length) return { primary: audios[0] };
            return { primary: videos[0], note: 'ℹ️ Audio-only isn\'t available for this platform in Browser Mode — showing the video instead.' };
        }
        if (!videos.length) return { primary: audios[0] };
        if (quality !== 'max') {
            const cap = parseInt(quality, 10);
            const fit = videos.find(v => v.height && v.height <= cap);
            if (fit) return { primary: fit };
        }
        return { primary: videos[0] };
    };

    // 6. Direct In-Browser Download Trigger
    const triggerAnchorDownload = (href, filename, newTab = false) => {
        const a = document.createElement('a');
        a.href = href;
        a.download = filename || 'media_download';
        if (newTab) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 1000);
    };

    const startInBrowserDownload = async (downloadUrl, filename, triggerBtn = null) => {
        if (!downloadUrl) return;

        const originalContent = triggerBtn ? triggerBtn.innerHTML : '';
        const setLabel = (txt) => { if (triggerBtn) triggerBtn.innerHTML = `<span>${txt}</span>`; };
        const restore = () => {
            if (!triggerBtn) return;
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = originalContent;
        };
        if (triggerBtn) triggerBtn.disabled = true;

        // Local yt-dlp engine sends Content-Disposition: let the browser handle it natively
        if (apiBase && downloadUrl.startsWith(apiBase)) {
            setLabel('⏳ Processing...');
            showToast('⏳ Engine is preparing your file... please wait');
            triggerAnchorDownload(downloadUrl, filename);
            setTimeout(restore, 3000);
            return;
        }

        // Browser Mode: cross-origin `download` attributes are ignored by browsers,
        // so fetch the media as a Blob (CDNs are CORS-enabled) to force a real file save.
        try {
            setLabel('⏳ Starting...');
            const res = await fetch(downloadUrl, { referrerPolicy: 'no-referrer' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const total = Number(res.headers.get('Content-Length')) || 0;
            let blob;
            if (res.body && typeof res.body.getReader === 'function') {
                const reader = res.body.getReader();
                const chunks = [];
                let received = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    setLabel(total
                        ? `⏳ Downloading ${Math.min(100, Math.round((received / total) * 100))}%`
                        : `⏳ Downloading ${(received / 1048576).toFixed(1)} MB`);
                }
                blob = new Blob(chunks, { type: res.headers.get('Content-Type') || 'application/octet-stream' });
            } else {
                blob = await res.blob();
            }

            const objectUrl = URL.createObjectURL(blob);
            triggerAnchorDownload(objectUrl, filename);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
            showToast('✅ Download complete! Check your downloads folder.');
        } catch (err) {
            // CDN refused CORS → open the raw file so the user can still save it
            console.warn('Blob download failed, opening direct link instead:', err);
            triggerAnchorDownload(downloadUrl, filename, true);
            showToast('↗ Opened in a new tab — right-click the video and choose "Save video as…"');
        } finally {
            restore();
        }
    };

    // 7. Main Fetch Controller
    const fetchMediaStreams = async (rawUrl) => {
        const url = rawUrl.trim();
        if (!url) return;

        hideAllStates();
        loadingState.style.display = 'flex';
        loadingText.textContent = hasLocalBackend
            ? `Analyzing media stream with yt-dlp...`
            : `Connecting to ${detectPlatform(url).name} stream...`;

        fetchBtn.disabled = true;
        fetchBtnText.textContent = 'Fetching...';

        try {
            const isAudio = selectedType === 'audio';
            const quality = qualitySelect.value;

            // BROWSER MODE (GitHub Pages / no local engine)
            if (!(hasLocalBackend && apiBase)) {
                const resolver = getBrowserResolver(url);
                if (!resolver) {
                    showUnsupportedNotice(url);
                    return;
                }

                const resolved = await resolver(url);
                if (!resolved.options || resolved.options.length === 0) {
                    throw new Error('No downloadable media was found at this link.');
                }

                const { primary, note } = pickPrimaryOption(resolved.options, isAudio, quality);
                if (note) showToast(note);

                currentVideoData = {
                    title: resolved.title,
                    author: resolved.author,
                    thumbnail: resolved.thumbnail || FALLBACK_THUMB,
                    duration: resolved.duration,
                    sourceUrl: url,
                    downloadUrl: primary.url,
                    platform: resolved.platform,
                    isAudio: primary.kind === 'audio',
                    ext: primary.ext,
                    quality: primary.quality,
                    formatLabel: primary.kind === 'audio' ? `${primary.ext.toUpperCase()} Audio` : 'MP4 Video',
                    primaryLabel: `Download ${primary.label}`,
                    qualityOptions: resolved.options,
                    timestamp: Date.now()
                };

                renderResult(currentVideoData);
                saveToHistory(currentVideoData);
                return;
            }

            // LOCAL YT-DLP ENGINE MODE
            const meta = await fetchVideoInfo(url);
            let primaryDownloadUrl = '';
            let qualityOptions = [];

            {
                // LOCAL YT-DLP ENGINE: Routes directly to our attachment stream endpoint!
                primaryDownloadUrl = `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=${isAudio ? 'audio' : 'video'}&quality=${quality}`;

                if (isAudio) {
                    qualityOptions = [
                        { label: 'MP3 (320 kbps High)', quality: '320', url: `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=audio&quality=320` },
                        { label: 'MP3 (256 kbps)', quality: '256', url: `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=audio&quality=256` },
                        { label: 'MP3 (128 kbps)', quality: '128', url: `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=audio&quality=128` }
                    ];
                } else {
                    const heights = meta.availableHeights && meta.availableHeights.length > 0 ? meta.availableHeights : [1080, 720, 480, 360];
                    qualityOptions = heights.slice(0, 4).map(h => ({
                        label: `${h}p HD MP4`,
                        quality: `${h}`,
                        url: `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=video&quality=${h}`
                    }));
                    qualityOptions.push({
                        label: 'Extract Audio (MP3)',
                        quality: '320',
                        url: `${apiBase}/api/download?url=${encodeURIComponent(url)}&type=audio&quality=320`
                    });
                }
            }

            currentVideoData = {
                title: meta.title,
                author: meta.author,
                thumbnail: meta.thumbnail,
                duration: meta.duration,
                sourceUrl: url,
                downloadUrl: primaryDownloadUrl,
                platform: meta.platform || detectPlatform(url).name,
                isAudio: isAudio,
                quality: isAudio ? `${quality} kbps` : (quality === 'max' ? '1080p Best' : `${quality}p`),
                qualityOptions: qualityOptions,
                timestamp: Date.now()
            };

            renderResult(currentVideoData);
            saveToHistory(currentVideoData);

        } catch (error) {
            console.error('Download error:', error);
            loadingState.style.display = 'none';
            errorState.style.display = 'flex';
            errorMessage.textContent = error.message || 'Could not fetch video. Please check the URL and try again.';
            if (!hasLocalBackend) {
                errorMessage.textContent += ' (The free public API may be busy — try again in a moment.)';
            }
            if (fallbackExternalLink) {
                fallbackExternalLink.href = `https://cobalt.tools/?u=${encodeURIComponent(url)}`;
                fallbackExternalLink.style.display = 'inline-flex';
            }
        } finally {
            fetchBtn.disabled = false;
            fetchBtnText.textContent = 'Fetch';
        }
    };

    // Show friendly guidance for platforms that can't be resolved in Browser Mode
    const showUnsupportedNotice = (url) => {
        const name = detectPlatform(url).name;
        const reason = name === 'YouTube'
            ? 'YouTube blocks every free public download server, so it needs a real yt-dlp backend.'
            : `${name === 'Video Link' ? 'This site' : name} has no public API that a browser can access directly.`;
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        errorMessage.innerHTML = `
            <strong>${escapeHtml(name)} isn't available in Browser Mode.</strong><br>
            ${escapeHtml(reason)} Browser Mode supports <b>TikTok</b>, <b>Twitter / X</b> and <b>Reddit</b>.
            Use the external tool below, or run the local engine on your computer:
            <code style="display:block;margin:0.75rem 0;padding:0.5rem;background:#040810;border-radius:6px;color:#38bdf8;font-family:monospace;">python3 video-download/server.py</code>
        `;

        if (fallbackExternalLink) {
            fallbackExternalLink.href = `https://cobalt.tools/?u=${encodeURIComponent(url)}`;
            fallbackExternalLink.style.display = 'inline-flex';
        }
    };

    // 8. Render Result & Setup Direct In-Browser Downloads
    const renderResult = (data) => {
        hideAllStates();
        resultSection.style.display = 'block';

        videoThumbnail.referrerPolicy = 'no-referrer';
        videoThumbnail.onerror = () => {
            videoThumbnail.onerror = null;
            videoThumbnail.src = FALLBACK_THUMB;
        };
        videoThumbnail.src = data.thumbnail || FALLBACK_THUMB;
        videoTitle.textContent = data.title;
        videoAuthor.textContent = data.author;
        resultPlatformBadge.textContent = data.platform;

        if (data.duration) {
            videoDuration.textContent = data.duration;
            videoDuration.style.display = 'block';
        } else {
            videoDuration.style.display = 'none';
        }

        mediaTypeBadge.textContent = data.formatLabel || (data.isAudio ? 'MP3 Audio' : 'MP4 Video');
        mediaQualityBadge.textContent = data.quality;

        primaryDownloadBtn.onclick = (e) => {
            e.preventDefault();
            if (primaryDownloadBtn.disabled) return;
            const ext = data.ext || (data.isAudio ? 'mp3' : 'mp4');
            const filename = `${safeFilename(data.title)}.${ext}`;
            startInBrowserDownload(data.downloadUrl, filename, primaryDownloadBtn);
        };

        primaryDownloadText.textContent = data.primaryLabel || (data.isAudio
            ? `Download MP3 Audio (${data.quality})`
            : `Download MP4 Video (${data.quality})`);

        // Populate Quality Pills
        additionalDownloads.innerHTML = '';
        if (data.qualityOptions && data.qualityOptions.length > 0) {
            data.qualityOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quality-pill';
                btn.innerHTML = `<span>⬇ ${escapeHtml(opt.label)}</span>`;
                btn.onclick = (e) => {
                    e.preventDefault();
                    const isAud = opt.kind ? opt.kind === 'audio' : (opt.label.includes('MP3') || opt.label.includes('Audio'));
                    const ext = opt.ext || (isAud ? 'mp3' : 'mp4');
                    const filename = `${safeFilename(data.title)}_${safeFilename(opt.quality)}.${ext}`;
                    startInBrowserDownload(opt.url, filename, btn);
                };
                additionalDownloads.appendChild(btn);
            });
        }

        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const hideAllStates = () => {
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        resultSection.style.display = 'none';
    };

    // 9. Form Submission
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchMediaStreams(urlInput.value);
    });

    retryBtn.addEventListener('click', () => {
        fetchMediaStreams(urlInput.value);
    });

    if (engineHelpBtn) {
        engineHelpBtn.addEventListener('click', () => {
            openEngineModal();
        });
    }

    // 10. Engine Setup Modal Controls
    const openEngineModal = () => {
        checkServerStatus(false);
        engineModal.style.display = 'grid';
    };

    const closeEngineModal = () => {
        engineModal.style.display = 'none';
    };

    if (engineStatusBtn) {
        engineStatusBtn.addEventListener('click', openEngineModal);
    }
    if (heroStatusBadge) {
        heroStatusBadge.addEventListener('click', openEngineModal);
    }
    if (closeEngineModalBtn) {
        closeEngineModalBtn.addEventListener('click', closeEngineModal);
    }
    if (dismissEngineModalBtn) {
        dismissEngineModalBtn.addEventListener('click', closeEngineModal);
    }
    if (engineModal) {
        engineModal.addEventListener('click', (e) => {
            if (e.target === engineModal) closeEngineModal();
        });
    }

    if (copyServerCmdBtn) {
        copyServerCmdBtn.addEventListener('click', () => {
            const cmd = serverCmdText ? serverCmdText.textContent : 'python3 video-download/server.py';
            navigator.clipboard.writeText(cmd);
            copyServerCmdBtn.textContent = 'Copied!';
            showToast('Copied start command to clipboard!');
            setTimeout(() => {
                copyServerCmdBtn.textContent = 'Copy';
            }, 2000);
        });
    }

    if (testEngineBtn) {
        testEngineBtn.addEventListener('click', async () => {
            testEngineBtn.textContent = 'Checking...';
            testEngineBtn.disabled = true;
            await checkServerStatus(true);
            testEngineBtn.textContent = 'Test Connection';
            testEngineBtn.disabled = false;
        });
    }

    // 11. Utilities (Copy Link, QR, Preview)
    copyStreamLinkBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.downloadUrl) return;
        const fullUrl = currentVideoData.downloadUrl.startsWith('http')
            ? currentVideoData.downloadUrl
            : `${apiBase || window.location.origin}${currentVideoData.downloadUrl}`;
        navigator.clipboard.writeText(fullUrl);
        showToast('Direct download link copied to clipboard!');
    });

    openSourceBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.sourceUrl) return;
        window.open(currentVideoData.sourceUrl, '_blank', 'noopener,noreferrer');
    });

    showQrBtn.addEventListener('click', () => {
        if (!currentVideoData) return;
        qrCodeTarget.innerHTML = '';

        // If downloadUrl is localhost, use sourceUrl for mobile QR so mobile devices can access it!
        let targetUrl = currentVideoData.downloadUrl;
        if (targetUrl.includes('127.0.0.1') || targetUrl.includes('localhost') || targetUrl.startsWith('/')) {
            targetUrl = currentVideoData.sourceUrl;
            qrLinkText.textContent = `Original Video: ${currentVideoData.title}`;
        } else {
            qrLinkText.textContent = currentVideoData.title;
        }

        try {
            new QRCode(qrCodeTarget, {
                text: targetUrl,
                width: 180,
                height: 180,
                colorDark: '#080c16',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
            qrModal.style.display = 'grid';
        } catch (e) {
            showToast('Unable to generate QR code');
        }
    });

    closeQrModalBtn.addEventListener('click', () => {
        qrModal.style.display = 'none';
    });

    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.style.display = 'none';
    });

    // 12. Media Preview Modal
    playPreviewBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.downloadUrl) return;
        previewModalTitle.textContent = currentVideoData.title;
        previewMediaContainer.innerHTML = '';

        if (currentVideoData.isAudio) {
            const audio = document.createElement('audio');
            audio.referrerPolicy = 'no-referrer';
            audio.controls = true;
            audio.autoplay = true;
            audio.src = currentVideoData.downloadUrl;
            previewMediaContainer.appendChild(audio);
        } else {
            const video = document.createElement('video');
            video.referrerPolicy = 'no-referrer';
            video.controls = true;
            video.autoplay = true;
            video.src = currentVideoData.downloadUrl;
            previewMediaContainer.appendChild(video);
        }

        previewModal.style.display = 'grid';
    });

    closePreviewModalBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
        previewMediaContainer.innerHTML = '';
    });

    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
            previewMediaContainer.innerHTML = '';
        }
    });

    // 13. Download History
    const saveToHistory = (item) => {
        downloadHistory = downloadHistory.filter(h => h.sourceUrl !== item.sourceUrl);
        downloadHistory.unshift(item);
        if (downloadHistory.length > 20) downloadHistory.pop();

        localStorage.setItem('tonetunnel_downloads', JSON.stringify(downloadHistory));
        updateHistoryUI();
    };

    const updateHistoryUI = () => {
        historyCount.textContent = downloadHistory.length;
        if (downloadHistory.length === 0) {
            historyList.innerHTML = '<p class="history-empty">Your recent downloads will appear here.</p>';
            return;
        }

        historyList.innerHTML = '';
        downloadHistory.slice(0, 8).forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-item-left">
                    <img src="${escapeHtml(item.thumbnail)}" alt="" class="history-thumb" referrerpolicy="no-referrer">
                    <div class="history-info">
                        <div class="history-name">${escapeHtml(item.title)}</div>
                        <span class="history-platform">${escapeHtml(item.platform)} · ${escapeHtml(item.quality)}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button type="button" class="btn-action-small">Download</button>
                </div>
            `;
            div.querySelector('.btn-action-small').onclick = () => {
                // CDN links (TikTok, X, Reddit) expire, so re-resolve fresh links from the source URL
                urlInput.value = item.sourceUrl;
                updatePlatformIcon();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                fetchMediaStreams(item.sourceUrl);
            };
            historyList.appendChild(div);
        });
    };

    clearHistoryBtn.addEventListener('click', () => {
        downloadHistory = [];
        localStorage.removeItem('tonetunnel_downloads');
        updateHistoryUI();
        showToast('Download history cleared');
    });

    historyBtn.addEventListener('click', () => {
        const historySection = document.getElementById('historySection');
        historySection.scrollIntoView({ behavior: 'smooth' });
    });

    updateHistoryUI();

    // 14. Toast Helper
    let toastTimeout;
    const showToast = (message) => {
        appToast.textContent = message;
        appToast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            appToast.classList.remove('show');
        }, 3000);
    };

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            qrModal.style.display = 'none';
            previewModal.style.display = 'none';
            if (engineModal) engineModal.style.display = 'none';
            previewMediaContainer.innerHTML = '';
        }
    });
});
