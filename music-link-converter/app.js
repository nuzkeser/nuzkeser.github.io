/**
 * ToneTunnel - Universal Music Link Converter Engine
 * Converts links across Spotify, YouTube Music, Apple Music, and YouTube
 * featuring Direct Play (https://music.youtube.com/watch?v=VIDEO_ID) and Direct Spotify track URLs.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Target Configurations & Theme Definitions (YTM, YouTube, Spotify, Apple)
  const TARGET_CONFIGS = {
    ytm: {
      name: 'YouTube Music',
      shortName: 'YT Music',
      color: '#ff0033',
      glow: 'rgba(255, 0, 51, 0.4)',
      actionText: 'Direct Play on YouTube Music',
      btnText: 'Play on YouTube Music',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l7.5 4.5-7.5 4.5z"/></svg>`
    },
    youtube: {
      name: 'YouTube',
      shortName: 'YouTube',
      color: '#ff0000',
      glow: 'rgba(255, 0, 0, 0.4)',
      actionText: 'Direct Play on YouTube Video',
      btnText: 'Play on YouTube',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>`
    },
    spotify: {
      name: 'Spotify',
      shortName: 'Spotify',
      color: '#1db954',
      glow: 'rgba(29, 185, 84, 0.4)',
      actionText: 'Open in Spotify',
      btnText: 'Open Spotify',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.341c-.218.359-.684.475-1.043.257-2.86-1.748-6.462-2.143-10.704-1.173-.406.094-.805-.162-.898-.567-.095-.405.161-.806.567-.899 4.643-1.06 8.625-.615 11.834 1.34.358.217.474.684.244 1.042zm1.474-3.277c-.274.446-.859.589-1.303.315-3.273-2.012-8.261-2.596-12.133-1.42-.5.152-1.026-.135-1.177-.636-.152-.5.136-1.027.636-1.178 4.423-1.343 9.924-.7 13.66 1.595.446.274.589.86.317 1.304zm.134-3.413C15.228 8.487 8.819 8.272 5.132 9.39c-.613.186-1.258-.168-1.444-.78-.186-.613.168-1.258.78-1.444 4.238-1.287 11.314-1.042 15.606 1.507.552.327.737 1.043.41 1.595-.327.552-1.042.738-1.595.411z"/></svg>`
    },
    apple: {
      name: 'Apple Music',
      shortName: 'Apple Music',
      color: '#fa243c',
      glow: 'rgba(250, 36, 60, 0.4)',
      actionText: 'Open in Apple Music',
      btnText: 'Open Apple Music',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.86 1.46-.61.72-1.15 1.88-.99 3 1.09.08 2.21-.54 2.86-1.36z"/></svg>`
    }
  };

  // State
  let currentTarget = localStorage.getItem('tonetunnel_target_platform') || localStorage.getItem('tunebridge_target_platform') || 'ytm';
  if (!TARGET_CONFIGS[currentTarget]) currentTarget = 'ytm';

  let autoOpen = localStorage.getItem('tonetunnel_auto_open') === 'true' || localStorage.getItem('tunebridge_auto_open') === 'true';
  let autoCopy = localStorage.getItem('tonetunnel_auto_copy') === 'true' || localStorage.getItem('tunebridge_auto_copy') === 'true';
  let currentTrackData = null;
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('tonetunnel_history') || localStorage.getItem('tunebridge_history') || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) {
    history = [];
  }

  // UI Elements
  const linkInput = document.getElementById('linkInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const convertBtn = document.getElementById('convertBtn');
  const convertForm = document.getElementById('convertForm');
  const targetChipsContainer = document.getElementById('targetChips');
  const autoOpenToggle = document.getElementById('autoOpenToggle');
  const autoOpenLabel = document.getElementById('autoOpenLabel');
  const targetSubtitleText = document.getElementById('targetSubtitleText');

  // Header Elements
  const headerTargetPill = document.getElementById('headerTargetPill');
  const targetDot = document.getElementById('targetDot');
  const targetName = document.getElementById('targetName');
  const settingsBtn = document.getElementById('settingsBtn');

  // States & Results
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  const resultSection = document.getElementById('resultSection');

  // Track Card
  const sourceBadge = document.getElementById('sourceBadge');
  const directBadge = document.getElementById('directBadge');
  const trackArt = document.getElementById('trackArt');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const trackMeta = document.getElementById('trackMeta');

  // Audio Preview
  const previewPlayBtn = document.getElementById('previewPlayBtn');
  const audioPlayerContainer = document.getElementById('audioPlayerContainer');
  const audioPreview = document.getElementById('audioPreview');
  const currentTimeEl = document.getElementById('currentTime');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const progressBarFill = document.getElementById('progressBarFill');

  // Primary CTA Card
  const primaryCtaCard = document.getElementById('primaryCtaCard');
  const primaryCtaLogo = document.getElementById('primaryCtaLogo');
  const ctaSubtitleText = document.getElementById('ctaSubtitleText');
  const ctaTitleText = document.getElementById('ctaTitleText');
  const primaryTargetBtn = document.getElementById('primaryTargetBtn');
  const primaryTargetBtnText = document.getElementById('primaryTargetBtnText');
  const copyTargetBtn = document.getElementById('copyTargetBtn');
  const qrTargetBtn = document.getElementById('qrTargetBtn');

  // Platforms Grid & History
  const platformsGrid = document.getElementById('platformsGrid');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // Modals
  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  const copyQrUrlBtn = document.getElementById('copyQrUrlBtn');

  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsModal = document.getElementById('closeSettingsModal');
  const targetSelectDropdown = document.getElementById('targetSelectDropdown');
  const settingsAutoOpenToggle = document.getElementById('settingsAutoOpenToggle');
  const settingsAutoCopyToggle = document.getElementById('settingsAutoCopyToggle');

  const bookmarkletBtn = document.getElementById('bookmarkletBtn');
  const bookmarkletModal = document.getElementById('bookmarkletModal');
  const closeBookmarkletModal = document.getElementById('closeBookmarkletModal');

  // Render Target Chips Dynamically with SVG Icons
  function renderTargetChips() {
    if (!targetChipsContainer) return;
    targetChipsContainer.innerHTML = Object.keys(TARGET_CONFIGS).map(key => {
      const cfg = TARGET_CONFIGS[key];
      const activeClass = key === currentTarget ? 'active' : '';
      return `
        <button type="button" class="target-chip ${activeClass}" data-target="${key}">
          ${cfg.iconSvg}
          <span>${cfg.name}</span>
        </button>
      `;
    }).join('');

    // Re-bind click events
    targetChipsContainer.querySelectorAll('.target-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        setTargetPlatform(chip.dataset.target);
      });
    });
  }

  // Event Listeners
  if (convertForm) {
    convertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      processInput();
    });
  }

  if (convertBtn) {
    convertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      processInput();
    });
  }

  if (linkInput) {
    linkInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        processInput();
      }
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          linkInput.value = text.trim();
          showToast('Link pasted!');
          processInput();
        }
      } catch (err) {
        showToast('Please paste the URL manually.');
      }
    });
  }

  if (headerTargetPill) headerTargetPill.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  if (settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => settingsModal.classList.add('hidden'));

  if (targetSelectDropdown) targetSelectDropdown.addEventListener('change', (e) => setTargetPlatform(e.target.value));

  if (autoOpenToggle) {
    autoOpenToggle.addEventListener('change', (e) => {
      autoOpen = e.target.checked;
      if (settingsAutoOpenToggle) settingsAutoOpenToggle.checked = autoOpen;
      localStorage.setItem('tonetunnel_auto_open', autoOpen);
      showToast(autoOpen ? 'Auto-open enabled!' : 'Auto-open disabled.');
    });
  }

  if (settingsAutoOpenToggle) {
    settingsAutoOpenToggle.addEventListener('change', (e) => {
      autoOpen = e.target.checked;
      if (autoOpenToggle) autoOpenToggle.checked = autoOpen;
      localStorage.setItem('tonetunnel_auto_open', autoOpen);
    });
  }

  if (settingsAutoCopyToggle) {
    settingsAutoCopyToggle.addEventListener('change', (e) => {
      autoCopy = e.target.checked;
      localStorage.setItem('tonetunnel_auto_copy', autoCopy);
      showToast(autoCopy ? 'Auto-copy enabled!' : 'Auto-copy disabled.');
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear conversion history?')) {
        history = [];
        localStorage.removeItem('tonetunnel_history');
        renderHistory();
        showToast('History cleared.');
      }
    });
  }

  // Audio Player Events
  if (previewPlayBtn) previewPlayBtn.addEventListener('click', toggleAudioPreview);
  if (audioPreview) {
    audioPreview.addEventListener('timeupdate', updateAudioProgress);
    audioPreview.addEventListener('ended', resetAudioState);
  }
  if (progressBarContainer) progressBarContainer.addEventListener('click', seekAudio);

  // CTA Events
  if (copyTargetBtn) {
    copyTargetBtn.addEventListener('click', () => {
      if (currentTrackData?.platforms[currentTarget]) {
        copyToClipboard(currentTrackData.platforms[currentTarget]);
      }
    });
  }

  if (qrTargetBtn) {
    qrTargetBtn.addEventListener('click', () => {
      if (currentTrackData?.platforms[currentTarget]) {
        showQrModal(currentTrackData.platforms[currentTarget]);
      }
    });
  }

  if (copyQrUrlBtn) {
    copyQrUrlBtn.addEventListener('click', () => {
      if (currentTrackData?.platforms[currentTarget]) {
        copyToClipboard(currentTrackData.platforms[currentTarget]);
      }
    });
  }

  if (closeQrModal) closeQrModal.addEventListener('click', () => qrModal.classList.add('hidden'));
  if (bookmarkletBtn) bookmarkletBtn.addEventListener('click', () => bookmarkletModal.classList.remove('hidden'));
  if (closeBookmarkletModal) closeBookmarkletModal.addEventListener('click', () => bookmarkletModal.classList.add('hidden'));

  // Initial Execution
  try {
    renderTargetChips();
    syncTargetUI();
    if (autoOpenToggle) autoOpenToggle.checked = autoOpen;
    if (settingsAutoOpenToggle) settingsAutoOpenToggle.checked = autoOpen;
    if (settingsAutoCopyToggle) settingsAutoCopyToggle.checked = autoCopy;
    renderHistory();
    checkUrlParams();
  } catch (err) {
    console.error('Initial state error:', err);
  }

  /**
   * Set Target Platform & Update Theme / UI
   */
  function setTargetPlatform(targetKey) {
    if (!TARGET_CONFIGS[targetKey]) return;
    currentTarget = targetKey;
    localStorage.setItem('tonetunnel_target_platform', currentTarget);
    renderTargetChips();
    syncTargetUI();
    
    if (currentTrackData) {
      updatePrimaryCta(currentTrackData);
      renderPlatformGrid(currentTrackData.platforms);
    }
  }

  function syncTargetUI() {
    const config = TARGET_CONFIGS[currentTarget] || TARGET_CONFIGS.ytm;

    document.documentElement.style.setProperty('--active-brand-color', config.color);
    document.documentElement.style.setProperty('--active-brand-glow', config.glow);

    if (targetDot) targetDot.style.background = config.color;
    if (targetName) targetName.textContent = config.name;
    if (targetSubtitleText) targetSubtitleText.textContent = config.name;
    if (autoOpenLabel) autoOpenLabel.textContent = `Auto-play in ${config.shortName} on conversion`;

    if (targetSelectDropdown) targetSelectDropdown.value = currentTarget;
  }

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url') || params.get('link');
    if (targetUrl) {
      linkInput.value = decodeURIComponent(targetUrl);
      processInput();
    }
  }

  /**
   * Main Conversion Handler
   */
  async function processInput() {
    const query = linkInput.value.trim();
    if (!query) {
      showError('Please paste or type a valid music link.');
      return;
    }

    hideError();
    showLoading();
    stopAudio();
    if (resultSection) resultSection.classList.add('hidden');

    try {
      let parsedData = null;

      try {
        const resp = await fetch(`/api/resolve?q=${encodeURIComponent(query)}`);
        if (resp.ok) {
          parsedData = await resp.json();
        }
      } catch (e) {
        console.log('Server resolution API unavailable, using client fallback...');
      }

      if (!parsedData || parsedData.error) {
        parsedData = await resolveMusicLinkClient(query);
      }

      if (!parsedData) {
        throw new Error('Could not resolve link metadata.');
      }

      currentTrackData = parsedData;
      displayResults(parsedData);
      addToHistory(parsedData);

      const targetUrl = parsedData.platforms[currentTarget] || parsedData.platforms.ytm;

      if (autoCopy) {
        copyToClipboard(targetUrl);
      }

      if (autoOpen && targetUrl) {
        window.open(targetUrl, '_blank');
      }

    } catch (err) {
      console.error(err);
      showError(err.message || 'Error processing music link.');
    } finally {
      hideLoading();
    }
  }

  /**
   * Display Resolved Track Results
   */
  function displayResults(data) {
    if (sourceBadge) sourceBadge.textContent = `Detected: ${data.sourcePlatform}`;
    if (directBadge) directBadge.textContent = data.isDirectPlay ? '⚡ Direct Play Ready' : '🔍 Search Resolved';

    if (trackArt) trackArt.src = data.artwork;
    if (trackTitle) trackTitle.textContent = data.title;
    if (trackArtist) trackArtist.textContent = data.artist;
    if (trackMeta) trackMeta.textContent = `${data.album} • ${data.year}`;

    if (data.audioPreviewUrl && audioPreview) {
      audioPreview.src = data.audioPreviewUrl;
      if (audioPlayerContainer) audioPlayerContainer.classList.remove('hidden');
      if (previewPlayBtn) previewPlayBtn.classList.remove('hidden');
    } else {
      if (audioPlayerContainer) audioPlayerContainer.classList.add('hidden');
      if (previewPlayBtn) previewPlayBtn.classList.add('hidden');
    }

    updatePrimaryCta(data);
    renderPlatformGrid(data.platforms);

    if (resultSection) {
      resultSection.classList.remove('hidden');
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Update Primary CTA Banner dynamically
   */
  function updatePrimaryCta(data) {
    const config = TARGET_CONFIGS[currentTarget] || TARGET_CONFIGS.ytm;
    const targetUrl = data.platforms[currentTarget] || data.platforms.ytm;

    if (primaryCtaCard) {
      primaryCtaCard.style.background = `linear-gradient(135deg, ${config.glow} 0%, rgba(20, 20, 35, 0.85) 100%)`;
      primaryCtaCard.style.borderColor = config.color;
    }

    if (primaryCtaLogo) primaryCtaLogo.innerHTML = config.iconSvg;
    if (ctaSubtitleText) {
      ctaSubtitleText.textContent = `${config.name} • ${data.isDirectPlay ? 'Direct Play' : 'Search Results'}`;
    }
    if (ctaTitleText) {
      ctaTitleText.textContent = data.isDirectPlay && (currentTarget === 'ytm' || currentTarget === 'youtube') 
        ? `Direct Play on ${config.shortName}` 
        : (data.isDirectPlay ? config.actionText : `Search on ${config.shortName}`);
    }

    if (primaryTargetBtn) {
      primaryTargetBtn.href = targetUrl;
      primaryTargetBtn.style.background = config.color;
      primaryTargetBtn.style.boxShadow = `0 6px 24px ${config.glow}`;
    }
    if (primaryTargetBtnText) {
      primaryTargetBtnText.textContent = data.isDirectPlay && (currentTarget === 'ytm' || currentTarget === 'youtube')
        ? `Play on ${config.shortName}`
        : (data.isDirectPlay ? config.btnText : `Search ${config.shortName}`);
    }
  }

  /**
   * Render Platform Grid (4 buttons side-by-side)
   */
  function renderPlatformGrid(platforms) {
    if (!platformsGrid) return;
    const list = Object.keys(TARGET_CONFIGS).map(key => {
      const cfg = TARGET_CONFIGS[key];
      return {
        key,
        name: cfg.name,
        color: cfg.color,
        url: platforms[key] || '#',
        icon: cfg.iconSvg
      };
    });

    platformsGrid.innerHTML = list.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="platform-btn ${p.key === currentTarget ? 'active-target-btn' : ''}">
        <div class="platform-info">
          <div class="platform-icon" style="background: ${p.color}20; color: ${p.color};">${p.icon}</div>
          <span class="platform-name">${p.name}</span>
        </div>
        <svg class="platform-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>
    `).join('');
  }

  /**
   * Client-side Fallback Resolver Engine
   */
  async function resolveMusicLinkClient(input) {
    let sourcePlatform = 'Search';
    let searchQuery = input;
    let spotifyDirectTrackUrl = null;

    if (input.includes('spotify.com/')) {
      sourcePlatform = 'Spotify';
      const spMatch = input.match(/track\/([a-zA-Z0-9]+)/);
      if (spMatch) {
        spotifyDirectTrackUrl = `https://open.spotify.com/track/${spMatch[1]}`;
      }
      try {
        const resp = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(input)}`);
        const data = await resp.json();
        searchQuery = cleanQueryText(data.title);
      } catch (e) {
        searchQuery = cleanQueryText(input);
      }
    } else if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
      sourcePlatform = input.includes('music.youtube.com') ? 'YouTube Music' : 'YouTube';
      try {
        const resp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(input)}&format=json`);
        const data = await resp.json();
        searchQuery = cleanQueryText(data.title);
      } catch (e) {
        searchQuery = cleanQueryText(input);
      }
    }

    let title = searchQuery;
    let artist = 'Unknown Artist';
    let album = 'Single';
    let year = '2026';
    let artwork = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
    let audioPreviewUrl = null;
    let appleMusicUrl = null;

    try {
      const resp = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=10`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
          let bestItem = data.results[0];
          let bestScore = -1;

          data.results.forEach(item => {
            const tName = item.trackName || '';
            const aName = item.artistName || '';
            const aScore = calcSimilarity(artist, aName);
            const tScore = calcSimilarity(title, tName);

            if (artist && aScore < 0.70) return;
            if (title && tScore < 0.70) return;

            const combined = (aScore + tScore) / 2.0;
            if (combined > bestScore) {
              bestScore = combined;
              bestItem = item;
            }
          });

          title = bestItem.trackName || title;
          artist = bestItem.artistName || artist;
          album = bestItem.collectionName || album;
          if (bestItem.releaseDate) year = bestItem.releaseDate.substring(0, 4);
          if (bestItem.artworkUrl100) artwork = bestItem.artworkUrl100.replace('100x100bb', '600x600bb');
          audioPreviewUrl = bestItem.previewUrl;
          appleMusicUrl = bestItem.trackViewUrl;
        }
      }
    } catch (e) {}

    const fullQuery = `${title} ${artist}`.trim();
    const encoded = encodeURIComponent(fullQuery);

    return {
      sourcePlatform,
      title,
      artist,
      album,
      year,
      artwork,
      audioPreviewUrl,
      isDirectPlay: false,
      platforms: {
        ytm: `https://music.youtube.com/search?q=${encoded}`,
        youtube: `https://www.youtube.com/results?search_query=${encoded}`,
        spotify: spotifyDirectTrackUrl || `https://open.spotify.com/search/${encoded}`,
        apple: appleMusicUrl || `https://music.apple.com/us/search?term=${encoded}`
      },
      originalUrl: input
    };
  }

  function cleanQueryText(text) {
    if (!text) return '';
    return text.replace(/(\(|\[)(Official|Audio|Video|4K|HD|Lyrics|Remastered|Topic|MV)(\)|\])/gi, '').replace(/\s+/g, ' ').trim();
  }

  function calcSimilarity(str1, str2) {
    if (!str1 || !str2) return 1.0;
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return 1.0;

    const words1 = (s1.match(/\w+/g) || []);
    const words2 = (s2.match(/\w+/g) || []);
    if (!words1.length || !words2.length) return 0.0;
    const set2 = new Set(words2);
    const common = words1.filter(w => set2.has(w));
    const minLen = Math.min(words1.length, words2.length);
    return minLen > 0 ? (common.length / minLen) : 0.0;
  }

  /**
   * Audio Controls
   */
  function toggleAudioPreview() {
    if (!audioPreview) return;
    if (audioPreview.paused) {
      audioPreview.play();
      if (previewPlayBtn) {
        previewPlayBtn.classList.add('playing');
        previewPlayBtn.querySelector('.play-icon')?.classList.add('hidden');
        previewPlayBtn.querySelector('.pause-icon')?.classList.remove('hidden');
      }
    } else {
      audioPreview.pause();
      if (previewPlayBtn) {
        previewPlayBtn.classList.remove('playing');
        previewPlayBtn.querySelector('.play-icon')?.classList.remove('hidden');
        previewPlayBtn.querySelector('.pause-icon')?.classList.add('hidden');
      }
    }
  }

  function stopAudio() {
    if (!audioPreview) return;
    audioPreview.pause();
    audioPreview.currentTime = 0;
    resetAudioState();
  }

  function resetAudioState() {
    if (previewPlayBtn) {
      previewPlayBtn.classList.remove('playing');
      previewPlayBtn.querySelector('.play-icon')?.classList.remove('hidden');
      previewPlayBtn.querySelector('.pause-icon')?.classList.add('hidden');
    }
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
  }

  function updateAudioProgress() {
    if (!audioPreview || !audioPreview.duration) return;
    const pct = (audioPreview.currentTime / audioPreview.duration) * 100;
    if (progressBarFill) progressBarFill.style.width = `${pct}%`;
    const mins = Math.floor(audioPreview.currentTime / 60);
    const secs = Math.floor(audioPreview.currentTime % 60).toString().padStart(2, '0');
    if (currentTimeEl) currentTimeEl.textContent = `${mins}:${secs}`;
  }

  function seekAudio(e) {
    if (!audioPreview || !audioPreview.duration || !progressBarContainer) return;
    const rect = progressBarContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioPreview.currentTime = pos * audioPreview.duration;
  }

  /**
   * History & Utilities
   */
  function addToHistory(track) {
    const targetConfig = TARGET_CONFIGS[currentTarget] || TARGET_CONFIGS.ytm;
    history = history.filter(item => item && (item.title !== track.title || item.artist !== track.artist));
    history.unshift({
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      targetUrl: track.platforms[currentTarget] || track.platforms.ytm,
      targetName: targetConfig.shortName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (history.length > 20) history.pop();
    try {
      localStorage.setItem('tonetunnel_history', JSON.stringify(history));
    } catch (e) {}
    renderHistory();
  }

  function renderHistory() {
    if (!historyCount || !historyList) return;
    historyCount.textContent = `${history.length} items`;
    if (history.length === 0) {
      historyList.innerHTML = `<div class="empty-history">No recent conversions. Links you paste will appear here for quick access.</div>`;
      return;
    }

    historyList.innerHTML = history.map(item => {
      if (!item) return '';
      const title = escapeHtml(item.title || 'Unknown Track');
      const artist = escapeHtml(item.artist || 'Unknown Artist');
      const tName = escapeHtml(item.targetName || 'YT Music');
      const tUrl = item.targetUrl || item.ytmUrl || '#';
      const timestamp = item.timestamp || '';
      const artwork = item.artwork || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';

      return `
        <div class="history-item">
          <div class="history-left">
            <img src="${artwork}" class="history-thumb" alt="art">
            <div class="history-details">
              <div class="history-title">${title}</div>
              <div class="history-artist">${artist} ${timestamp ? '• ' + timestamp : ''}</div>
            </div>
          </div>
          <div class="history-right">
            <a href="${tUrl}" target="_blank" rel="noopener noreferrer" class="history-open-btn">
              ▶️ ${tName}
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function showQrModal(url) {
    if (!qrCodeContainer) return;
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
      text: url,
      width: 180,
      height: 180,
      colorDark: "#0b0f19",
      colorLight: "#ffffff"
    });
    if (qrModal) qrModal.classList.remove('hidden');
  }

  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Link copied to clipboard!');
    }).catch(() => {
      showToast('Could not copy link.');
    });
  }

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2800);
  }

  function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
  }

  function hideLoading() {
    if (loadingState) loadingState.classList.add('hidden');
  }

  function showError(msg) {
    if (errorMessage) errorMessage.textContent = msg;
    if (errorState) errorState.classList.remove('hidden');
  }

  function hideError() {
    if (errorState) errorState.classList.add('hidden');
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }
});
