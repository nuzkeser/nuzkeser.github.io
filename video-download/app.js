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

        // If page is served over http/https, try same origin first
        if (window.location.protocol.startsWith('http')) {
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
                showToast('⚠️ Could not connect to local server on port 8080.');
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
            if (headerStatusDot) {
                headerStatusDot.className = 'status-indicator-dot offline';
            }
            if (headerStatusText) {
                headerStatusText.textContent = 'Engine Offline';
            }
            if (heroPulseDot) {
                heroPulseDot.style.backgroundColor = '#f59e0b';
                heroPulseDot.style.boxShadow = '0 0 8px #f59e0b';
            }
            if (heroBadgeText) {
                heroBadgeText.textContent = 'Download Engine Offline · Click to Setup';
            }
            if (modalStatusDot) {
                modalStatusDot.className = 'status-indicator-dot offline';
            }
            if (modalStatusText) {
                modalStatusText.textContent = 'Server Offline (No response on port 8080)';
            }
        }
    };

    // Initial check and periodic heartbeat
    checkServerStatus();
    setInterval(() => {
        if (!hasLocalBackend) {
            checkServerStatus(false);
        }
    }, 6000);

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
                            thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
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

        // TikTok Client-Side Fallback via TikWM (Works in browser without server!)
        if (detectPlatform(url).name === 'TikTok') {
            try {
                const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
                if (tikRes.ok) {
                    const tikData = await tikRes.json();
                    if (tikData && tikData.code === 0 && tikData.data) {
                        const d = tikData.data;
                        return {
                            title: d.title || 'TikTok Video',
                            author: (d.author && (d.author.nickname || d.author.unique_id)) || 'TikTok Creator',
                            thumbnail: d.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
                            duration: d.duration ? `${d.duration}s` : '',
                            platform: 'TikTok',
                            sourceUrl: url,
                            availableHeights: [1080, 720],
                            directStreams: {
                                video: d.play || d.wmplay,
                                audio: d.music
                            }
                        };
                    }
                }
            } catch (e) {
                console.warn('TikWM fetch warning:', e);
            }
        }

        // Generic OEmbed / YouTube thumbnail extraction
        let detectedTitle = 'Media Ready to Download';
        let detectedAuthor = detectPlatform(url).name;
        let detectedThumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';

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

    // 6. Direct In-Browser Download Trigger
    const startInBrowserDownload = (downloadUrl, filename, triggerBtn = null) => {
        showToast('⏳ Preparing download... please wait');

        let originalContent = '';
        if (triggerBtn) {
            originalContent = triggerBtn.innerHTML;
            triggerBtn.disabled = true;
            triggerBtn.innerHTML = `<span>⏳ Downloading...</span>`;
        }

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'media_download';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            if (a.parentNode) document.body.removeChild(a);
            if (triggerBtn && originalContent) {
                triggerBtn.disabled = false;
                triggerBtn.innerHTML = originalContent;
            }
            showToast('✅ Download initiated! Check your browser downloads.');
        }, 3000);
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
            const meta = await fetchVideoInfo(url);
            const isAudio = selectedType === 'audio';
            const quality = qualitySelect.value;

            let primaryDownloadUrl = '';
            let qualityOptions = [];

            if (hasLocalBackend && apiBase) {
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
            } else if (meta.directStreams) {
                // CLIENT-SIDE STREAM RESOLUTION (e.g. TikTok via TikWM)
                if (isAudio && meta.directStreams.audio) {
                    primaryDownloadUrl = meta.directStreams.audio;
                } else {
                    primaryDownloadUrl = meta.directStreams.video;
                }

                qualityOptions = [
                    { label: 'Original MP4 Video', quality: 'HD', url: meta.directStreams.video },
                    { label: 'Original MP3 Audio', quality: 'Audio', url: meta.directStreams.audio }
                ].filter(opt => !!opt.url);

            } else {
                // Local engine is offline and platform cannot be extracted purely client-side
                showOfflineEngineNotice(url, meta);
                return;
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
            if (fallbackExternalLink) {
                fallbackExternalLink.href = `https://cobalt.tools/?u=${encodeURIComponent(url)}`;
                fallbackExternalLink.style.display = 'inline-flex';
            }
        } finally {
            fetchBtn.disabled = false;
            fetchBtnText.textContent = 'Fetch';
        }
    };

    // Show friendly guidance when engine is offline
    const showOfflineEngineNotice = (url, meta) => {
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        errorMessage.innerHTML = `
            <strong>Local Download Engine is Offline.</strong><br>
            To download high-quality videos and MP3 audio from ${detectPlatform(url).name} with no ads or limits, start the local server in your terminal:
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

        videoThumbnail.src = data.thumbnail;
        videoTitle.textContent = data.title;
        videoAuthor.textContent = data.author;
        resultPlatformBadge.textContent = data.platform;

        if (data.duration) {
            videoDuration.textContent = data.duration;
            videoDuration.style.display = 'block';
        } else {
            videoDuration.style.display = 'none';
        }

        mediaTypeBadge.textContent = data.isAudio ? 'MP3 Audio' : 'MP4 Video';
        mediaQualityBadge.textContent = data.quality;

        primaryDownloadBtn.onclick = (e) => {
            e.preventDefault();
            const ext = data.isAudio ? 'mp3' : 'mp4';
            const filename = `${data.title.replace(/[^\w\s-]/g, '').trim() || 'media'}.${ext}`;
            startInBrowserDownload(data.downloadUrl, filename, primaryDownloadBtn);
        };

        primaryDownloadText.textContent = data.isAudio
            ? `Download MP3 Audio (${data.quality})`
            : `Download MP4 Video (${data.quality})`;

        // Populate Quality Pills
        additionalDownloads.innerHTML = '';
        if (data.qualityOptions && data.qualityOptions.length > 0) {
            data.qualityOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quality-pill';
                btn.innerHTML = `<span>⬇ ${opt.label}</span>`;
                btn.onclick = (e) => {
                    e.preventDefault();
                    const isAud = opt.label.includes('MP3') || opt.label.includes('Audio');
                    const ext = isAud ? 'mp3' : 'mp4';
                    const filename = `${data.title.replace(/[^\w\s-]/g, '').trim() || 'media'}_${opt.quality}.${ext}`;
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
            audio.controls = true;
            audio.autoplay = true;
            audio.src = currentVideoData.downloadUrl;
            previewMediaContainer.appendChild(audio);
        } else {
            const video = document.createElement('video');
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
                    <img src="${item.thumbnail}" alt="" class="history-thumb">
                    <div class="history-info">
                        <div class="history-name">${item.title}</div>
                        <span class="history-platform">${item.platform} · ${item.quality}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button type="button" class="btn-action-small">Download</button>
                </div>
            `;
            div.querySelector('.btn-action-small').onclick = () => {
                const ext = item.isAudio ? 'mp3' : 'mp4';
                const filename = `${item.title.replace(/[^\w\s-]/g, '').trim() || 'media'}.${ext}`;
                startInBrowserDownload(item.downloadUrl, filename);
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
