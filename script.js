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
 * Opens search results in a new browser tab.
 */
function searchVideos() {
  var query = document.getElementById('searchBox').value.trim(); // Gets and trims the search query
  if (query) {
    // Opens YouTube search results in a new tab
    window.open(
      'https://www.youtube.com/results?search_query=' + encodeURIComponent(query),
      '_blank'
    );
  } else {
    // Alerts the user if the search field is empty
    alert('Please enter a search term.');
  }
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
