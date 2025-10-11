# YouTube Video Mixer

[Live Demo](https://www.youtubemixer.com.br)

DJ-style video mixer for YouTube. Search, load, and crossfade between two videos with smooth audio mixing.

## Features

- **🔍 Search Modal:** Search YouTube videos in-app with one-click loading
- **🎚️ Audio Crossfader:** Professional constant-power panning for smooth transitions
- **🎮 Dual Decks:** Independent playback controls for each video
- **⌨️ Keyboard Shortcuts:** Full keyboard control for hands-free mixing
- **📱 Responsive:** Works on desktop and mobile devices

## Quick Start

1. Clone the repository
2. Create `api/.env` file with your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_key_here
   ```
3. Upload to your web server
4. Open in browser and start mixing!

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Q/W/E** | Play/Pause/Stop Deck A |
| **A/S/D** | Play/Pause/Stop Deck B |
| **← →** | Adjust crossfader |
| **Shift + Scroll** | Adjust crossfader with mouse |
| **Enter** | Search |
| **ESC** | Close modal |

## Technologies

- HTML5, CSS3, JavaScript (ES6)
- YouTube IFrame Player API
- PHP backend for secure API key storage
- Optional Invidious API for privacy

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

**Rafael Beznos**

[LinkedIn](https://www.linkedin.com/in/rafaelbeznos) | [Instagram](https://www.instagram.com/oceanicaos.art) | [Live Demo](https://www.youtubemixer.com.br)

