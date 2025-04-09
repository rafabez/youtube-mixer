// Variables to store YouTube player instances
var player1, player2;

/**
 * Helper Function: Converts a linear fader value (0->100) to a smooth logarithmic scale.
 * This provides a more natural volume adjustment.
 * @param {number} value - The linear fader value.
 * @returns {number} - The adjusted volume level on a logarithmic scale.
 */
function logScale(value) {
  var fraction = value / 100;
  fraction = fraction * fraction; // Applies a quadratic scale for a smooth logarithmic effect
  return Math.round(fraction * 100);
}

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
 * Applies a logarithmic scale for a more natural volume adjustment.
 */
document.getElementById('fader').addEventListener('input', function() {
  var linearValue = parseInt(this.value, 10); // Gets the current fader value
  var volume1 = logScale(100 - linearValue);  // Calculates volume for Video 1
  var volume2 = logScale(linearValue);        // Calculates volume for Video 2
  player1.setVolume(volume1);                  // Sets volume for Player 1
  player2.setVolume(volume2);                  // Sets volume for Player 2
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
 * Function to Add Keyboard Functionalities.
 * 1. Pressing Enter in the search field triggers the search.
 * 2. Pressing the right and left arrow keys adjusts the fader.
 */
function addKeyboardShortcuts() {
  // Event to detect key presses
  document.addEventListener('keydown', function(event) {
    // 1. Functionality: Pressing Enter in the search field triggers the search
    var searchBox = document.getElementById('searchBox');
    if (document.activeElement === searchBox && event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission action
      searchVideos(); // Calls the search function
    }

    // 2. Functionality: Pressing the right and left arrow keys adjusts the fader
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); // Prevent page scrolling when using arrow keys
      var fader = document.getElementById('fader');
      var step = 5; // Defines the fader adjustment step

      if (event.key === 'ArrowLeft') {
        // Decreases the fader value
        fader.value = Math.max(parseInt(fader.value, 10) - step, 0);
      } else if (event.key === 'ArrowRight') {
        // Increases the fader value
        fader.value = Math.min(parseInt(fader.value, 10) + step, 100);
      }

      // Triggers the 'input' event to update the volumes
      var eventInput = new Event('input');
      fader.dispatchEvent(eventInput);
    }
  });
}

// Calls the function to add keyboard shortcuts after the page loads
window.onload = function() {
  addKeyboardShortcuts();
};
