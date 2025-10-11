# YouTube Video Mixer
[Live Demo](https://www.youtubemixer.com.br)
## Project Overview
YouTube Video Mixer is a web application that allows users to search, load, and mix two YouTube videos. Users can control video playback and adjust the audio mix between the two videos with an interactive slider.

## Features
- **🔍 Smart Search Modal:** Search YouTube videos in a beautiful modal interface
  - Results appear instantly in a grid layout
  - Hover over videos to see "Load in Deck A/B" buttons
  - One-click loading directly into either deck
  - Press ESC to close, Enter to search
- **🎥 Dual Video Players:** Load and play two YouTube videos simultaneously
- **🎚️ Audio Crossfader:** Smooth constant-power crossfading between videos
- **🎮 Playback Controls:** Independent play, pause, and stop for each video
- **⌨️ Keyboard Shortcuts:**
  - **Q/W/E:** Control Video 1 (Play/Pause/Stop)
  - **A/S/D:** Control Video 2 (Play/Pause/Stop)
  - **Arrow Keys:** Adjust crossfader
  - **Shift + Scroll:** Adjust crossfader with mouse
  - **Enter:** Trigger search
  - **ESC:** Close search modal

## Technologies Used
- **HTML5** for page structure
- **CSS3** for styling and responsiveness
- **JavaScript (ES6)** for interactivity
- **YouTube IFrame Player API** for video playback integration
- **PHP Backend** for secure API key storage
- **Invidious API** (optional) for privacy-respecting search

## Free Software Compliance

This project is **Free Software** licensed under the MIT License:
- ✅ Source code available: https://github.com/rafabez/youtube-mixer
- ✅ Direct download: https://github.com/rafabez/youtube-mixer/archive/refs/heads/main.zip
- ✅ LibreJS compatible with proper license headers
- ✅ Optional Invidious integration for privacy (see `FREE_SOFTWARE_COMPLIANCE.md`)

**Privacy Options:**
- Use **YouTube API** (default) - requires API key, has quota limits
- Use **Invidious API** (optional) - no API key, no limits, no tracking

See `FREE_SOFTWARE_COMPLIANCE.md` for details on switching to Invidious.

## File Structure
```
youtube-mixer/
├── index.html       # Main HTML file
├── styles.css       # Stylesheet for layout and design
├── script.js        # JavaScript for functionality
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites
- A web browser (Chrome, Firefox, Edge)
- Git installed on your machine

### Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rafabez/youtube-mixer.git
   ```
2. **Navigate to the Project Folder:**
   ```bash
   cd youtube-mixer
   ```
3. **Open `index.html` in your browser** to start using the application.

### Deployment
You can deploy this project using GitHub Pages:
1. Push your code to GitHub.
2. Go to the repository settings.
3. Enable GitHub Pages from the `main` branch.
4. Your app will be live at `https://rafabez.github.io/youtube-mixer/`

## Usage
1. **Search Videos:** 
   - Type in the search bar and click **Search** (or press Enter)
   - Browse results in the modal
   - Hover over a video and click **"Load in Deck A"** or **"Load in Deck B"**
   - Video loads instantly and modal closes
2. **Alternative - Manual URL:** Paste YouTube links into the input fields and click **Load**
3. **Control Playback:** Use buttons or keyboard shortcuts (Q/W/E for Deck A, A/S/D for Deck B)
4. **Mix Audio:** Move the crossfader slider to balance audio between videos (or use arrow keys)

## Contributing
Contributions are welcome! Feel free to submit pull requests or open issues for feature suggestions and bug fixes.

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- Google Fonts for typography

---

**Developed by Rafael Beznos**

[LinkedIn](https://www.linkedin.com/in/rafaelbeznos) | [Instagram](https://www.instagram.com/oceanicaos.art) | [Live Demo](https://www.youtubemixer.com.br)

