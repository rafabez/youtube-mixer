// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt MIT
// @source https://github.com/rafabez/youtube-mixer
// @source-download https://github.com/rafabez/youtube-mixer/archive/refs/heads/main.zip
// 
// This is Free Software licensed under the MIT License.
// You are free to use, modify, and distribute this software.
// Source code is available at: https://github.com/rafabez/youtube-mixer

// Variables to store YouTube player instances
var player1, player2;

// Removed logScale function as it's replaced by constant power panning

/**
 * YouTube Players Initialization Function.
 * This function is automatically called by the YouTube IFrame API when it's ready.
 */
function onYouTubeIframeAPIReady() {
  // Initialize Player 1
  player1 = new YT.Player('player1', {
    height: '405', // Player height in pixels
    width: '720',  // Player width in pixels
    videoId: '',    // Initially no video loaded
    playerVars: { 
      autoplay: 0,  // Does not autoplay
      controls: 1   // Shows player controls
    }
  });

  // Initialize Player 2
  player2 = new YT.Player('player2', {
    height: '405',
    width: '720',
    videoId: '',
    playerVars: { 
      autoplay: 0, 
      controls: 1 
    }
  });
}

/**
 * Function to Search YouTube Videos.
 * Fetches results from PHP backend and displays in modal.
 */
async function searchVideos() {
  var query = document.getElementById('searchBox').value.trim();
  
  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  // Show loading state
  showSearchLoading();

  try {
    // Call PHP backend endpoint
    // OPTION 1: YouTube API (requires API key, has quota limits)
    // const response = await fetch(`api/youtube-search.php?q=${encodeURIComponent(query)}`);
    
    // OPTION 2: Invidious API (no API key needed, unlimited searches, privacy-respecting)
    const response = await fetch(`api/invidious-search.php?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Display results in modal
    displaySearchResults(data.items || []);
    
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed. Please try again. Error: ' + error.message);
    closeSearchModal();
  }
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
 * @param {Array} items - Array of video items from YouTube API
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
    
    if (!videoId || !snippet) return;
    
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="result-thumbnail">
        <img src="${snippet.thumbnails.medium.url}" alt="${escapeHtml(snippet.title)}" loading="lazy">
        <div class="result-overlay">
          <button class="deck-button deck-a" onclick="loadVideoFromSearch('${videoId}', 1)" title="Load in Deck A">
            Load in Deck A
          </button>
          <button class="deck-button deck-b" onclick="loadVideoFromSearch('${videoId}', 2)" title="Load in Deck B">
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
  if (!videoId) {
    alert('Invalid video ID');
    return;
  }
  
  // Load video into the appropriate player
  if (deckNumber === 1) {
    player1.cueVideoById(videoId);
    // Update the input field with the full URL
    document.getElementById('videoLink1').value = `https://www.youtube.com/watch?v=${videoId}`;
  } else if (deckNumber === 2) {
    player2.cueVideoById(videoId);
    // Update the input field with the full URL
    document.getElementById('videoLink2').value = `https://www.youtube.com/watch?v=${videoId}`;
  }
  
  // Close the search modal
  closeSearchModal();
  
  // Optional: Show confirmation
  console.log(`Video ${videoId} loaded into Deck ${deckNumber === 1 ? 'A' : 'B'}`);
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
  return div.innerHTML;
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
    // Loads the video into the appropriate player
    if (videoNumber === 1) {
      player1.cueVideoById(videoId);
    } else {
      player2.cueVideoById(videoId);
    }
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
  if (videoNumber === 1) {
    player1.playVideo();
  } else {
    player2.playVideo();
  }
}

/**
 * Function to Pause the Specified Video.
 * @param {number} videoNumber - The player number (1 or 2) to pause the video.
 */
function pauseVideo(videoNumber) {
  if (videoNumber === 1) {
    player1.pauseVideo();
  } else {
    player2.pauseVideo();
  }
}

/**
 * Function to Stop the Specified Video.
 * @param {number} videoNumber - The player number (1 or 2) to stop the video.
 */
function stopVideo(videoNumber) {
  if (videoNumber === 1) {
    player1.stopVideo();
  } else {
    player2.stopVideo();
  }
}

/**
 * Event: Adjusts the Volume of Both Videos Based on the Fader Position.
 * Applies a constant power panning algorithm for smooth crossfading.
 */
document.getElementById('fader').addEventListener('input', function() {
  var faderValue = parseInt(this.value, 10); // Fader value from 0 to 100

  // Map the fader value (0-100) to an angle (0 to PI/2 radians)
  var angle = (faderValue / 100) * (Math.PI / 2);

  // Calculate volumes using constant power panning law
  var volume1 = Math.round(Math.cos(angle) * 100); // Volume for Video 1 (decreases as fader moves right)
  var volume2 = Math.round(Math.sin(angle) * 100); // Volume for Video 2 (increases as fader moves right)

  // Ensure players are ready before setting volume
  if (player1 && typeof player1.setVolume === 'function') {
      player1.setVolume(volume1);                  // Sets volume for Player 1
  }
  if (player2 && typeof player2.setVolume === 'function') {
      player2.setVolume(volume2);                  // Sets volume for Player 2
  }
});

/**
 * Function to Extract the YouTube Video ID from a URL.
 * Supports standard YouTube URLs with the 'v' parameter.
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} - The extracted video ID or null if invalid.
 */
function extractVideoID(url) {
  try {
    var urlParams = new URLSearchParams(new URL(url).search); // Parses the URL parameters
    return urlParams.get('v'); // Returns the value of the 'v' parameter
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
 * - Q/W/E: Control Video 1 (Play/Pause/Stop).
 * - A/S/D: Control Video 2 (Play/Pause/Stop).
 */
function addKeyboardShortcuts() {
  // Event listener for keydown events
  document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';

    // --- ESC Key: Close Search Modal ---
    if (event.key === 'Escape') {
      const searchModal = document.getElementById('searchModal');
      if (searchModal && !searchModal.classList.contains('hidden')) {
        closeSearchModal();
        return;
      }
    }

    // --- Search Shortcut ---
    if (activeElement.id === 'searchBox' && event.key === 'Enter') {
      event.preventDefault();
      searchVideos();
      return; // Don't process other shortcuts if searching
    }

    // Ignore playback/fader shortcuts if user is typing in an input field
    if (isTyping) {
      return;
    }

    // --- Fader Arrow Key Shortcuts ---
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
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
      const scrollStep = event.deltaY > 0 ? -5 : 5; // Adjust step based on scroll direction
      let currentValue = parseInt(fader.value, 10);
      
      fader.value = Math.max(0, Math.min(100, currentValue + scrollStep));

      // Trigger the 'input' event manually
      fader.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, { passive: false }); // Need passive: false to allow preventDefault
}

// Calls the function to add shortcuts after the page loads
window.onload = function() {
  addKeyboardShortcuts();
  // Potentially add other onload tasks here if needed
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
