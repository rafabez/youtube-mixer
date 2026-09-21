// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt MIT
// @source https://github.com/rafabez/youtube-mixer
// @source-download https://github.com/rafabez/youtube-mixer/archive/refs/heads/main.zip
//
// This is Free Software licensed under the MIT License.
// You are free to use, modify, and distribute this software.
// Source code is available at: https://github.com/rafabez/youtube-mixer

// Variables to store YouTube player instances
var player1, player2;

// Per-deck state: loaded video, volume trim (0-100), playback speed and cue point (seconds)
var decks = {
  1: { videoId: null, trim: 100, speed: 1, cue: null },
  2: { videoId: null, trim: 100, speed: 1, cue: null }
};

// Key used to remember decks and fader between visits
var STORAGE_KEY = 'youtubeMixerState';

/**
 * YouTube Players Initialization Function.
 * This function is automatically called by the YouTube IFrame API when it's ready.
 */
function onYouTubeIframeAPIReady() {
  player1 = createPlayer('player1', 1);
  player2 = createPlayer('player2', 2);
}

/**
 * Creates a YouTube player for a deck, restoring its saved video (cued, not playing).
 * @param {string} elementId - Container element ID.
 * @param {number} deckNumber - Deck number (1 or 2).
 */
function createPlayer(elementId, deckNumber) {
  return new YT.Player(elementId, {
    height: '405', // Player height in pixels
    width: '720',  // Player width in pixels
    videoId: decks[deckNumber].videoId || '',
    playerVars: {
      autoplay: 0,  // Does not autoplay
      controls: 1   // Shows player controls
    },
    events: {
      onReady: function() {
        applyVolumes();
        applySpeed(deckNumber);
      },
      // YouTube ignores a playback rate set before the video is loaded, so re-apply it
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.CUED) {
          applySpeed(deckNumber);
        }
        // Show the Auto Mix title once it is known
        if (event.data === YT.PlayerState.PLAYING && autoMix.enabled && !autoMix.fading && deckNumber === autoMix.activeDeck) {
          updateAutoMixUI();
        }
      },
      onError: function() {
        autoMixOnError(deckNumber);
      }
    }
  });
}

function getPlayer(deckNumber) {
  return deckNumber === 1 ? player1 : player2;
}

/**
 * True once the player's API methods are available.
 */
function isPlayerReady(player) {
  return player && typeof player.setVolume === 'function';
}

/**
 * Function to Search Videos.
 * Tries the YouTube Data API first; if it fails (e.g. daily quota used up),
 * falls back to the Invidious endpoint.
 */
async function searchVideos() {
  var query = document.getElementById('searchBox').value.trim();

  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  // Show loading state
  showSearchLoading();

  var endpoints = ['api/youtube-search.php', 'api/invidious-search.php'];
  var lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Display results in modal
      displaySearchResults(data.items || []);
      return;
    } catch (error) {
      console.warn(`Search via ${endpoint} failed:`, error);
      lastError = error;
    }
  }

  alert('Search failed. Please try again later. Error: ' + lastError.message);
  closeSearchModal();
}

/**
 * Shows loading state in search modal
 */
function showSearchLoading() {
  const modal = document.getElementById('searchModal');
  const resultsContainer = document.getElementById('searchResults');

  if (modal && resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="search-loading">
        <div class="spinner"></div>
        <p>Searching YouTube...</p>
      </div>
    `;
    modal.classList.remove('hidden');
  }
}

/**
 * Displays search results in the modal
 * @param {Array} items - Array of video items (YouTube API format)
 */
function displaySearchResults(items) {
  const modal = document.getElementById('searchModal');
  const resultsContainer = document.getElementById('searchResults');

  if (!modal || !resultsContainer) {
    console.error('Search modal elements not found');
    return;
  }

  // Clear loading state
  resultsContainer.innerHTML = '';

  // Check if we have results
  if (!items || items.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No videos found. Try a different search term.</p>
      </div>
    `;
    modal.classList.remove('hidden');
    return;
  }

  // Create result cards
  items.forEach(item => {
    const videoId = item.videoId || item.id?.videoId;
    const snippet = item.snippet;

    if (!isValidVideoId(videoId) || !snippet) return;

    const thumbnail = snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="result-thumbnail">
        <img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(snippet.title)}" loading="lazy">
        <div class="result-overlay">
          <button class="deck-button deck-a" data-deck="1" title="Load in Deck A">
            Load in Deck A
          </button>
          <button class="deck-button deck-b" data-deck="2" title="Load in Deck B">
            Load in Deck B
          </button>
        </div>
      </div>
      <div class="result-info">
        <h3 class="result-title">${escapeHtml(snippet.title)}</h3>
        <p class="result-channel">${escapeHtml(snippet.channelTitle)}</p>
        <p class="result-description">${escapeHtml(truncateText(snippet.description, 100))}</p>
      </div>
    `;

    card.querySelectorAll('.deck-button').forEach(button => {
      button.addEventListener('click', () => loadVideoFromSearch(videoId, parseInt(button.dataset.deck, 10)));
    });

    resultsContainer.appendChild(card);
  });

  // Show modal
  modal.classList.remove('hidden');
}

/**
 * Loads a video from search results into specified deck
 * @param {string} videoId - YouTube video ID
 * @param {number} deckNumber - Deck number (1 or 2)
 */
function loadVideoFromSearch(videoId, deckNumber) {
  if (!isValidVideoId(videoId)) {
    alert('Invalid video ID');
    return;
  }

  loadDeck(deckNumber, videoId);

  // Close the search modal
  closeSearchModal();
}

/**
 * Cues a video on a deck (or starts it, with autoplay), updates its URL field and remembers it.
 * @param {number} deckNumber - Deck number (1 or 2)
 * @param {string} videoId - YouTube video ID
 * @param {boolean} [autoplay] - Start playing right away
 */
function loadDeck(deckNumber, videoId, autoplay) {
  var player = getPlayer(deckNumber);
  if (!isPlayerReady(player)) {
    alert('The player is still loading. Please try again in a moment.');
    return;
  }

  // playVideo() right after cueVideoById() is dropped while the video loads, so use loadVideoById()
  if (autoplay) {
    player.loadVideoById(videoId);
  } else {
    player.cueVideoById(videoId);
  }
  document.getElementById('videoLink' + deckNumber).value = `https://www.youtube.com/watch?v=${videoId}`;

  // Clear the previous video's cue point
  decks[deckNumber].videoId = videoId;
  decks[deckNumber].cue = null;
  updateCueLabel(deckNumber);

  saveState();
}

/**
 * Opens the search modal
 */
function openSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Closes the search modal
 */
function closeSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/"/g, '&quot;');
}

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Function to Load a Video into the Specified Player.
 * @param {number} videoNumber - The player number (1 or 2) to load the video into.
 */
function loadVideo(videoNumber) {
  // Gets the video link from the input field
  var link = document.getElementById('videoLink' + videoNumber).value.trim();
  var videoId = extractVideoID(link); // Extracts the video ID from the URL
  if (videoId) {
    loadDeck(videoNumber, videoId);
  } else {
    // Alerts the user if the YouTube link is invalid
    alert('Invalid YouTube link. Please enter a valid URL.');
  }
}

/**
 * Function to Play the Specified Video.
 * @param {number} videoNumber - The player number (1 or 2) to play the video.
 */
function playVideo(videoNumber) {
  var player = getPlayer(videoNumber);
  if (isPlayerReady(player)) {
    player.playVideo();
  }
}

/**
 * Function to Pause the Specified Video.
 * @param {number} videoNumber - The player number (1 or 2) to pause the video.
 */
function pauseVideo(videoNumber) {
  var player = getPlayer(videoNumber);
  if (isPlayerReady(player)) {
    player.pauseVideo();
  }
}

/**
 * Function to Stop the Specified Video.
 * @param {number} videoNumber - The player number (1 or 2) to stop the video.
 */
function stopVideo(videoNumber) {
  var player = getPlayer(videoNumber);
  if (isPlayerReady(player)) {
    player.stopVideo();
  }
}

/**
 * Sets both players' volumes from the crossfader and each deck's volume trim.
 * The crossfader uses a constant power panning law for smooth transitions.
 */
function applyVolumes() {
  var faderValue = parseInt(document.getElementById('fader').value, 10); // Fader value from 0 to 100

  // Map the fader value (0-100) to an angle (0 to PI/2 radians)
  var angle = (faderValue / 100) * (Math.PI / 2);

  // Crossfader gain per deck: Deck 1 decreases and Deck 2 increases as the fader moves right
  var gains = { 1: Math.cos(angle), 2: Math.sin(angle) };

  [1, 2].forEach(function(deckNumber) {
    var player = getPlayer(deckNumber);
    if (isPlayerReady(player)) {
      player.setVolume(Math.round(gains[deckNumber] * decks[deckNumber].trim));
    }
  });
}

/**
 * Event: Adjusts the Volume of Both Videos Based on the Fader Position.
 */
document.getElementById('fader').addEventListener('input', function() {
  applyVolumes();
  saveState();
});

/**
 * Sets a deck's volume trim (0-100), applied on top of the crossfader.
 * @param {number} deckNumber - Deck number (1 or 2)
 * @param {string|number} value - Trim value
 */
function setTrim(deckNumber, value) {
  decks[deckNumber].trim = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
  document.getElementById('trimValue' + deckNumber).textContent = decks[deckNumber].trim + '%';
  applyVolumes();
  saveState();
}

/**
 * Sets a deck's playback speed.
 * @param {number} deckNumber - Deck number (1 or 2)
 * @param {string|number} value - Playback rate (e.g. 0.75, 1, 1.25)
 */
function setSpeed(deckNumber, value) {
  decks[deckNumber].speed = parseFloat(value) || 1;
  applySpeed(deckNumber);
  saveState();
}

function applySpeed(deckNumber) {
  var player = getPlayer(deckNumber);
  if (isPlayerReady(player) && player.getPlaybackRate() !== decks[deckNumber].speed) {
    player.setPlaybackRate(decks[deckNumber].speed);
  }
}

/**
 * Stores the current position of a deck as its cue point.
 * @param {number} deckNumber - Deck number (1 or 2)
 */
function setCue(deckNumber) {
  var player = getPlayer(deckNumber);
  if (!isPlayerReady(player) || !decks[deckNumber].videoId) {
    return;
  }
  decks[deckNumber].cue = player.getCurrentTime();
  updateCueLabel(deckNumber);
  saveState();
}

/**
 * Jumps a deck to its cue point (or the start, if none is set) and keeps playing.
 * @param {number} deckNumber - Deck number (1 or 2)
 */
function jumpToCue(deckNumber) {
  var player = getPlayer(deckNumber);
  if (!isPlayerReady(player) || !decks[deckNumber].videoId) {
    return;
  }
  player.seekTo(decks[deckNumber].cue || 0, true);
  player.playVideo();
}

function updateCueLabel(deckNumber) {
  var cue = decks[deckNumber].cue;
  document.getElementById('cueTime' + deckNumber).textContent = cue === null ? '--:--' : formatTime(cue);
}

/**
 * Formats seconds as m:ss.
 */
function formatTime(seconds) {
  var total = Math.floor(seconds);
  var minutes = Math.floor(total / 60);
  var secs = total % 60;
  return minutes + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * Saves decks and fader position to localStorage.
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fader: parseInt(document.getElementById('fader').value, 10),
      decks: decks
    }));
  } catch (e) {
    // Storage can be unavailable (private mode, blocked site data); nothing to do
  }
}

/**
 * Restores decks and fader position saved by a previous visit.
 */
function loadSavedState() {
  var saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    saved = null;
  }
  if (!saved) return;

  if (typeof saved.fader === 'number') {
    document.getElementById('fader').value = saved.fader;
  }

  [1, 2].forEach(function(deckNumber) {
    var deck = saved.decks && saved.decks[deckNumber];
    if (!deck) return;

    if (isValidVideoId(deck.videoId)) {
      decks[deckNumber].videoId = deck.videoId;
      decks[deckNumber].cue = typeof deck.cue === 'number' ? deck.cue : null;
      document.getElementById('videoLink' + deckNumber).value = `https://www.youtube.com/watch?v=${deck.videoId}`;
    }
    if (typeof deck.trim === 'number') {
      decks[deckNumber].trim = Math.max(0, Math.min(100, deck.trim));
    }
    if (typeof deck.speed === 'number') {
      decks[deckNumber].speed = deck.speed;
    }

    // Reflect restored values in the deck controls
    document.getElementById('trim' + deckNumber).value = decks[deckNumber].trim;
    document.getElementById('trimValue' + deckNumber).textContent = decks[deckNumber].trim + '%';
    document.getElementById('speed' + deckNumber).value = String(decks[deckNumber].speed);
    updateCueLabel(deckNumber);
  });
}

/**
 * True for a well-formed YouTube video ID (11 characters: letters, digits, - and _).
 */
function isValidVideoId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);
}

/**
 * Function to Extract the YouTube Video ID from a URL.
 * Supports youtube.com/watch?v=, youtu.be/, /shorts/, /embed/, /live/ links and bare video IDs.
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} - The extracted video ID or null if invalid.
 */
function extractVideoID(url) {
  if (isValidVideoId(url)) {
    return url;
  }
  try {
    var parsed = new URL(url);
    var host = parsed.hostname.replace(/^(www\.|m\.|music\.)/, '');
    var id = null;

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/')[1];
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = parsed.searchParams.get('v');
      if (!id) {
        var match = parsed.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
        id = match ? match[2] : null;
      }
    }
    return isValidVideoId(id) ? id : null;
  } catch (e) {
    // Returns null if the URL is invalid or parsing fails
    return null;
  }
}

/**
 * Function to Add Keyboard and Scroll Functionalities.
 * - Enter in search field: Trigger search.
 * - Arrow Keys: Adjust fader.
 * - Shift + Scroll: Adjust fader.
 * - Q/W/E: Control Video 1 (Play/Pause/Stop). R: jump to cue, Shift+R: set cue.
 * - A/S/D: Control Video 2 (Play/Pause/Stop). F: jump to cue, Shift+F: set cue.
 * - N: Skip to the next video in Auto Mix.
 */
function addKeyboardShortcuts() {
  // Event listener for keydown events
  document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' && activeElement.type === 'text' || activeElement.tagName === 'TEXTAREA';

    // --- ESC Key: Close Modals ---
    if (event.key === 'Escape') {
      const searchModal = document.getElementById('searchModal');
      if (searchModal && !searchModal.classList.contains('hidden')) {
        closeSearchModal();
        return;
      }
      const infoModal = document.getElementById('infoModal');
      if (infoModal && !infoModal.classList.contains('hidden')) {
        closeInfoModal();
        return;
      }
    }

    // --- Search Shortcut ---
    if (activeElement.id === 'searchBox' && event.key === 'Enter') {
      event.preventDefault();
      searchVideos();
      return; // Don't process other shortcuts if searching
    }

    // --- Load URL with Enter in a deck's link field ---
    if ((activeElement.id === 'videoLink1' || activeElement.id === 'videoLink2') && event.key === 'Enter') {
      event.preventDefault();
      loadVideo(activeElement.id === 'videoLink1' ? 1 : 2);
      return;
    }

    // Ignore playback/fader shortcuts if user is typing in an input field
    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    // --- Fader Arrow Key Shortcuts ---
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // Let focused sliders and selects handle their own arrow keys
      if (activeElement.tagName === 'SELECT' || (activeElement.type === 'range' && activeElement.id !== 'fader')) {
        return;
      }
      event.preventDefault();
      const fader = document.getElementById('fader');
      const step = 5;
      let currentValue = parseInt(fader.value, 10);

      if (event.key === 'ArrowLeft') {
        fader.value = Math.max(currentValue - step, 0);
      } else { // ArrowRight
        fader.value = Math.min(currentValue + step, 100);
      }
      // Trigger the 'input' event manually
      fader.dispatchEvent(new Event('input', { bubbles: true }));
      return; // Processed fader shortcut
    }

    // --- Playback Shortcuts ---
    switch (event.key.toUpperCase()) {
      // Video 1 Controls
      case 'Q':
        playVideo(1);
        break;
      case 'W':
        pauseVideo(1);
        break;
      case 'E':
        stopVideo(1);
        break;
      case 'R':
        event.shiftKey ? setCue(1) : jumpToCue(1);
        break;
      // Video 2 Controls
      case 'A':
        playVideo(2);
        break;
      case 'S':
        pauseVideo(2);
        break;
      case 'D':
        stopVideo(2);
        break;
      case 'F':
        event.shiftKey ? setCue(2) : jumpToCue(2);
        break;
      // Auto Mix
      case 'N':
        skipAutoMix();
        break;
      default:
        return; // Not a playback shortcut key
    }
    event.preventDefault(); // Prevent default action for playback keys
  });

  // --- Fader Scroll Shortcut ---
  document.addEventListener('wheel', function(event) {
    // Check if Shift key is pressed
    if (event.shiftKey) {
      event.preventDefault(); // Prevent page scrolling

      const fader = document.getElementById('fader');
      // Browsers may report Shift+wheel as horizontal scroll
      const delta = event.deltaY || event.deltaX;
      const scrollStep = delta > 0 ? -5 : 5; // Adjust step based on scroll direction
      let currentValue = parseInt(fader.value, 10);

      fader.value = Math.max(0, Math.min(100, currentValue + scrollStep));

      // Trigger the 'input' event manually
      fader.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, { passive: false }); // Need passive: false to allow preventDefault

  // --- Keep shortcuts working after clicking a video ---
  // Clicking a YouTube player moves keyboard focus into its iframe, where this page
  // no longer receives key presses. Take focus back once the click is done.
  // Chrome reports this with a window blur event; Firefox doesn't, so also check periodically.
  function reclaimFocusFromPlayer() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'IFRAME') {
      activeElement.blur();
      window.focus();
    }
  }
  window.addEventListener('blur', function() {
    setTimeout(reclaimFocusFromPlayer, 0);
  });
  setInterval(reclaimFocusFromPlayer, 250);
}

/* ============================================
 * Auto Mix (background mode)
 * Keeps playing related videos, crossfading from the audible deck to the other one
 * shortly before each video ends.
 * ============================================ */

// Seconds before the end of a video when the crossfade to the next one starts
var AUTO_MIX_FADE_SECONDS = 10;
// Crossfade length when skipping or recovering from an unplayable video
var AUTO_MIX_QUICK_FADE_SECONDS = 3;
// Wait before trying again when no related video could be found
var AUTO_MIX_RETRY_MS = 15000;

var autoMix = {
  enabled: false,
  activeDeck: 1,     // Deck currently audible
  seedId: null,      // Video Auto Mix started from; picks stay close to it
  played: [],        // Video IDs already played (or unplayable), never picked again
  fading: false,
  fadeTimer: null,
  monitorTimer: null,
  retryAt: 0,
  relatedCache: {}   // videoId -> Promise of related items
};

function toggleAutoMix() {
  if (autoMix.enabled) {
    stopAutoMix();
  } else {
    startAutoMix();
  }
}

function startAutoMix() {
  if (!isPlayerReady(player1) || !isPlayerReady(player2)) {
    alert('The players are still loading. Please try again in a moment.');
    return;
  }

  // Continue from the deck that is playing, else from a deck with a video (Deck A first)
  var deck = [1, 2].find(function(n) { return getPlayer(n).getPlayerState() === YT.PlayerState.PLAYING; })
    || [1, 2].find(function(n) { return decks[n].videoId; });
  if (!deck) {
    alert('Load a video on a deck first. Auto Mix continues from it with related videos.');
    return;
  }

  autoMix.enabled = true;
  autoMix.activeDeck = deck;
  autoMix.seedId = decks[deck].videoId;
  autoMix.played = [autoMix.seedId];
  autoMix.fading = false;
  autoMix.retryAt = 0;

  getPlayer(deck).playVideo();
  animateFader(deck === 1 ? 0 : 100, 1.5);
  getRelated(autoMix.seedId); // Prefetch so the first transition is instant

  clearInterval(autoMix.monitorTimer);
  autoMix.monitorTimer = setInterval(checkAutoMix, 1000);
  updateAutoMixUI();
}

function stopAutoMix() {
  autoMix.enabled = false;
  autoMix.fading = false;
  clearInterval(autoMix.monitorTimer);
  clearInterval(autoMix.fadeTimer);
  updateAutoMixUI('Auto Mix is off.');
}

/**
 * Skips to the next related video with a short crossfade.
 */
function skipAutoMix() {
  if (autoMix.enabled && !autoMix.fading) {
    autoMixNext(AUTO_MIX_QUICK_FADE_SECONDS);
  }
}

/**
 * Runs every second: starts the crossfade when the audible video is about to end.
 */
function checkAutoMix() {
  if (!autoMix.enabled || autoMix.fading || Date.now() < autoMix.retryAt) {
    return;
  }
  var player = getPlayer(autoMix.activeDeck);
  var state = player.getPlayerState();

  if (state === YT.PlayerState.ENDED) {
    autoMixNext(AUTO_MIX_QUICK_FADE_SECONDS);
    return;
  }
  if (state !== YT.PlayerState.PLAYING) {
    return; // Paused by the user: the mix waits too
  }

  var data = player.getVideoData();
  var duration = player.getDuration();
  if (!duration || (data && data.isLive)) {
    return; // Live streams never end; use Skip to move on
  }

  // Remaining real time, taking the deck's playback speed into account
  var remaining = (duration - player.getCurrentTime()) / decks[autoMix.activeDeck].speed;
  if (remaining <= AUTO_MIX_FADE_SECONDS) {
    autoMixNext(Math.max(remaining, 1));
  }
}

/**
 * Loads the next related video on the other deck, starts it and crossfades to it.
 * @param {number} fadeSeconds - Crossfade length
 */
async function autoMixNext(fadeSeconds) {
  if (autoMix.fading) return;
  autoMix.fading = true;

  var fromDeck = autoMix.activeDeck;
  var toDeck = fromDeck === 1 ? 2 : 1;

  setAutoMixStatus('Finding the next video…');
  var next = await pickNextVideo();
  if (!autoMix.enabled) return;

  if (!next) {
    autoMix.fading = false;
    autoMix.retryAt = Date.now() + AUTO_MIX_RETRY_MS;
    setAutoMixStatus('Couldn\'t find a related video right now. Trying again shortly…');
    return;
  }

  autoMix.played.push(next.videoId);
  loadDeck(toDeck, next.videoId, true);
  autoMix.activeDeck = toDeck;
  setAutoMixStatus('Mixing into Deck ' + deckLetter(toDeck) + ': ' + next.title);

  animateFader(toDeck === 1 ? 0 : 100, fadeSeconds, function() {
    getPlayer(fromDeck).pauseVideo();
    autoMix.fading = false;
    updateAutoMixUI();
    getRelated(next.videoId); // Prefetch for the next transition
  });
}

/**
 * Chooses the next video from videos related to the seed and to the last played ones,
 * skipping anything already played. Returns {videoId, title} or null.
 */
async function pickNextVideo() {
  var recent = autoMix.played.slice(-2).filter(function(id) { return id !== autoMix.seedId; });
  var sources = [{ id: autoMix.seedId, weight: 2 }].concat(recent.map(function(id) { return { id: id, weight: 1 }; }));

  var pick = await rankRelated(sources);
  if (!pick) {
    // Everything close to the seed was played: widen to the last few videos
    pick = await rankRelated(autoMix.played.slice(-5).map(function(id) { return { id: id, weight: 1 }; }));
  }
  return pick;
}

async function rankRelated(sources) {
  var lists = await Promise.all(sources.map(function(source) {
    return getRelated(source.id).then(function(items) { return { items: items, weight: source.weight }; });
  }));

  var scores = {};
  var titles = {};
  lists.forEach(function(list) {
    list.items.forEach(function(item, rank) {
      var id = item.videoId;
      if (!isValidVideoId(id) || autoMix.played.includes(id) || id === decks[1].videoId || id === decks[2].videoId) {
        return;
      }
      // Videos higher in a related list, or related to several sources, score higher
      scores[id] = (scores[id] || 0) + list.weight * (1 - rank / (list.items.length + 1));
      titles[id] = (item.snippet && item.snippet.title) || '';
    });
  });

  var ranked = Object.keys(scores).sort(function(a, b) { return scores[b] - scores[a]; });
  if (!ranked.length) return null;

  // Pick randomly among the best few for some variety
  var id = ranked[Math.floor(Math.random() * Math.min(3, ranked.length))];
  return { videoId: id, title: titles[id] };
}

/**
 * Related videos for a video ID (cached per page; failures are retried next time).
 */
function getRelated(videoId) {
  if (!autoMix.relatedCache[videoId]) {
    autoMix.relatedCache[videoId] = fetch(`api/related.php?v=${encodeURIComponent(videoId)}`)
      .then(function(response) { return response.ok ? response.json() : {}; })
      .then(function(data) { return data.items || []; })
      .catch(function() { return []; })
      .then(function(items) {
        if (!items.length) delete autoMix.relatedCache[videoId];
        return items;
      });
  }
  return autoMix.relatedCache[videoId];
}

/**
 * Handles a player error (e.g. the video can't be embedded) while Auto Mix is on.
 */
function autoMixOnError(deckNumber) {
  if (!autoMix.enabled || deckNumber !== autoMix.activeDeck) return;

  if (autoMix.fading) {
    // The incoming video failed: fade back to the previous deck; the next check picks another
    // (the failed ID is already in autoMix.played)
    clearInterval(autoMix.fadeTimer);
    autoMix.activeDeck = deckNumber === 1 ? 2 : 1;
    autoMix.fading = false;
    animateFader(autoMix.activeDeck === 1 ? 0 : 100, 1);
  } else {
    autoMixNext(AUTO_MIX_QUICK_FADE_SECONDS);
  }
}

/**
 * Moves the crossfader to a target position over time.
 * Progress is based on the clock, so throttled timers in background tabs still finish on time.
 */
function animateFader(target, seconds, done) {
  clearInterval(autoMix.fadeTimer);
  var fader = document.getElementById('fader');
  var start = parseInt(fader.value, 10);
  var startTime = Date.now();
  var duration = Math.max(seconds, 0.1) * 1000;

  autoMix.fadeTimer = setInterval(function() {
    var progress = Math.min(1, (Date.now() - startTime) / duration);
    fader.value = Math.round(start + (target - start) * progress);
    applyVolumes();
    if (progress >= 1) {
      clearInterval(autoMix.fadeTimer);
      saveState();
      if (done) done();
    }
  }, 100);
}

function deckLetter(deckNumber) {
  return deckNumber === 1 ? 'A' : 'B';
}

function setAutoMixStatus(message) {
  document.getElementById('autoMixStatus').textContent = message;
}

function updateAutoMixUI(message) {
  var toggle = document.getElementById('autoMixToggle');
  toggle.textContent = autoMix.enabled ? 'Auto Mix: On' : 'Auto Mix: Off';
  toggle.setAttribute('aria-pressed', String(autoMix.enabled));
  toggle.classList.toggle('active', autoMix.enabled);
  document.getElementById('autoMixSkip').disabled = !autoMix.enabled;

  if (message) {
    setAutoMixStatus(message);
  } else if (autoMix.enabled) {
    var data = getPlayer(autoMix.activeDeck).getVideoData();
    setAutoMixStatus('Now playing on Deck ' + deckLetter(autoMix.activeDeck) + (data && data.title ? ': ' + data.title : ''));
  }
}

// Restore the previous session right away (this script runs after the markup it needs)
loadSavedState();

// Calls the function to add shortcuts after the page loads
window.onload = function() {
  addKeyboardShortcuts();
};

/**
 * Opens the information modal.
 */
function openInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Closes the information modal.
 */
function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// @license-end
