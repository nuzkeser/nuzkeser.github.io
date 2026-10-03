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

    // Public Cobalt API instances for direct stream download extraction (no redirects)
    const COBALT_INSTANCES = [
        'https://api.cobalt.tools',
        'https://cobalt.api.kwiatekm.tokyo',
        'https://co.wuk.sh',
        'https://cobalt-api.kellr.dev'
    ];

    // State Variables
    let hasLocalBackend = false;
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

    // States & Results
    const loadingState = document.getElementById('loadingState');
    const loadingText = document.getElementById('loadingText');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
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

    // 1. Check for Local yt-dlp Backend Server
    const checkServerStatus = async () => {
        try {
            const res = await fetch('/api/status', { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                if (data && data.has_ytdlp) {
                    hasLocalBackend = true;
                    const pill = document.querySelector('.pill-badge');
                    if (pill) {
                        pill.innerHTML = `<span class="pulse-dot" style="background-color:#10b981;box-shadow:0 0 8px #10b981;"></span><span>yt-dlp Engine Active · Direct In-Browser Downloads</span>`;
                    }
                }
            }
        } catch (e) {
            // Running in static hosting mode
            hasLocalBackend = false;
        }
    };
    checkServerStatus();

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
                    <option value="1080" selected>1080p Full HD</option>
                    <option value="720">720p HD</option>
                    <option value="480">480p SD</option>
                    <option value="360">360p</option>
                    <option value="max">Best Available</option>
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

    // 5. Fetch Video Info via yt-dlp Backend OR Static OEmbed
    const fetchVideoInfo = async (url) => {
        if (hasLocalBackend) {
            try {
                const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
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
                            availableHeights: data.available_heights || [1080, 720, 480, 360]
                        };
                    }
                }
            } catch (err) {
                console.warn('Local yt-dlp info failed, falling back to universal resolver', err);
            }
        }

        // Static mode universal metadata
        try {
            const noembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            if (noembedRes.ok) {
                const data = await noembedRes.json();
                if (data && data.title) {
                    return {
                        title: data.title,
                        author: data.author_name || detectPlatform(url).name,
                        thumbnail: data.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
                        duration: '',
                        platform: detectPlatform(url).name,
                        sourceUrl: url,
                        availableHeights: [1080, 720, 480, 360]
                    };
                }
            }
        } catch (e) {
            console.warn('Metadata fetch warning:', e);
        }

        return {
            title: 'Media Ready to Download',
            author: detectPlatform(url).name,
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
            duration: '',
            platform: detectPlatform(url).name,
            sourceUrl: url,
            availableHeights: [1080, 720, 480, 360]
        };
    };

    // 6. Direct In-Browser Download Trigger
    const startInBrowserDownload = (downloadUrl, filename) => {
        showToast('Download started! Saving file...');
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'media_download';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) document.body.removeChild(a);
        }, 1500);
    };

    // 7. Resolve Direct Stream using Cobalt API (Static Mode)
    const requestDirectStream = async (url, isAudioOnly, quality) => {
        const payload = {
            url: url,
            vQuality: quality === 'max' ? '1080' : quality,
            isAudioOnly: isAudioOnly,
            aFormat: 'mp3',
            filenamePattern: 'basic'
        };

        for (const instance of COBALT_INSTANCES) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);

                const response = await fetch(`${instance}/api/json`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data && (data.url || (data.picker && data.picker.length > 0))) {
                        return {
                            streamUrl: data.url || data.picker[0].url,
                            picker: data.picker || [],
                            filename: data.filename || (isAudioOnly ? 'audio.mp3' : 'video.mp4')
                        };
                    }
                }
            } catch (err) {
                continue;
            }
        }
        return null;
    };

    // 8. Main Fetch Controller
    const fetchMediaStreams = async (rawUrl) => {
        const url = rawUrl.trim();
        if (!url) return;

        hideAllStates();
        loadingState.style.display = 'flex';
        loadingText.textContent = hasLocalBackend
            ? `Analyzing media stream with yt-dlp...`
            : `Analyzing ${detectPlatform(url).name} stream...`;

        fetchBtn.disabled = true;
        fetchBtnText.textContent = 'Fetching...';

        try {
            const meta = await fetchVideoInfo(url);
            const isAudio = selectedType === 'audio';
            const quality = qualitySelect.value;

            let primaryDownloadUrl = '';
            let qualityOptions = [];

            if (hasLocalBackend) {
                // LOCAL YT-DLP ENGINE: Directly routes to our attachment stream endpoint!
                primaryDownloadUrl = `/api/download?url=${encodeURIComponent(url)}&type=${isAudio ? 'audio' : 'video'}&quality=${quality}`;

                if (isAudio) {
                    qualityOptions = [
                        { label: 'MP3 (320 kbps High)', quality: '320', url: `/api/download?url=${encodeURIComponent(url)}&type=audio&quality=320` },
                        { label: 'MP3 (256 kbps)', quality: '256', url: `/api/download?url=${encodeURIComponent(url)}&type=audio&quality=256` },
                        { label: 'MP3 (128 kbps)', quality: '128', url: `/api/download?url=${encodeURIComponent(url)}&type=audio&quality=128` }
                    ];
                } else {
                    const heights = meta.availableHeights.length > 0 ? meta.availableHeights : [1080, 720, 480, 360];
                    qualityOptions = heights.slice(0, 4).map(h => ({
                        label: `${h}p HD MP4`,
                        quality: `${h}`,
                        url: `/api/download?url=${encodeURIComponent(url)}&type=video&quality=${h}`
                    }));
                    // Add an audio option as well
                    qualityOptions.push({
                        label: 'Extract Audio (MP3)',
                        quality: '320',
                        url: `/api/download?url=${encodeURIComponent(url)}&type=audio&quality=320`
                    });
                }
            } else {
                // STATIC WEB STREAM ENGINE: Resolve direct stream URL directly into the browser
                loadingText.textContent = `Resolving direct high-speed ${isAudio ? 'MP3' : 'MP4'} stream...`;
                const streamResult = await requestDirectStream(url, isAudio, quality);

                if (streamResult && streamResult.streamUrl) {
                    primaryDownloadUrl = streamResult.streamUrl;
                    if (streamResult.picker && streamResult.picker.length > 0) {
                        qualityOptions = streamResult.picker.map(p => ({
                            label: p.type === 'video' ? `${p.quality || 'MP4'} Video` : 'MP3 Audio',
                            url: p.url,
                            quality: p.quality || 'HD'
                        }));
                    }
                } else {
                    throw new Error('Unable to extract direct stream for this URL. Please verify the link is public.');
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
        } finally {
            fetchBtn.disabled = false;
            fetchBtnText.textContent = 'Fetch';
        }
    };

    // 9. Render Result & Setup Direct In-Browser Downloads
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
            startInBrowserDownload(data.downloadUrl, filename);
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
                    startInBrowserDownload(opt.url, filename);
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

    // 10. Form Submission
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchMediaStreams(urlInput.value);
    });

    retryBtn.addEventListener('click', () => {
        fetchMediaStreams(urlInput.value);
    });

    // 11. Utilities (Copy Link, QR, Preview)
    copyStreamLinkBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.downloadUrl) return;
        const fullUrl = currentVideoData.downloadUrl.startsWith('http')
            ? currentVideoData.downloadUrl
            : `${window.location.origin}${currentVideoData.downloadUrl}`;
        navigator.clipboard.writeText(fullUrl);
        showToast('Direct download link copied to clipboard!');
    });

    openSourceBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.sourceUrl) return;
        window.open(currentVideoData.sourceUrl, '_blank', 'noopener,noreferrer');
    });

    showQrBtn.addEventListener('click', () => {
        if (!currentVideoData || !currentVideoData.downloadUrl) return;
        qrCodeTarget.innerHTML = '';
        const fullUrl = currentVideoData.downloadUrl.startsWith('http')
            ? currentVideoData.downloadUrl
            : `${window.location.origin}${currentVideoData.downloadUrl}`;

        try {
            new QRCode(qrCodeTarget, {
                text: fullUrl,
                width: 180,
                height: 180,
                colorDark: '#080c16',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
            qrLinkText.textContent = currentVideoData.title;
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
            previewMediaContainer.innerHTML = '';
        }
    });
});
