# YouTube Video Mixer

[Live Demo](https://youtubemixer.online)

DJ-style video mixer for YouTube. Search, load, and crossfade between two videos with smooth audio mixing.

## Features

- **🔍 Search Modal:** Search YouTube videos in-app with one-click loading (falls back to Invidious if the YouTube API quota runs out)
- **🎚️ Audio Crossfader:** Professional constant-power panning for smooth transitions
- **🎮 Dual Decks:** Independent playback controls for each video
- **🎛️ Deck Controls:** Per-deck volume, playback speed (0.5×–2×) and cue points
- **💾 Remembers Your Session:** Decks, volumes, speeds, cue points and fader position are restored on your next visit
- **⌨️ Keyboard Shortcuts:** Full keyboard control for hands-free mixing
- **📱 Responsive:** Works on desktop and mobile devices

## Quick Start

1. Clone the repository
2. Copy `api/.env.example` to `api/.env` and add your YouTube API key (optional: without it, search uses Invidious):
   ```
   YOUTUBE_API_KEY=your_key_here
   ```
3. Upload to a PHP web server (Apache, with cURL), or run locally with `php -S localhost:8000`
4. Open in browser and start mixing!

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Q/W/E** | Play/Pause/Stop Deck A |
| **A/S/D** | Play/Pause/Stop Deck B |
| **R / F** | Jump to cue point (Deck A / B) |
| **Shift + R / F** | Set cue point (Deck A / B) |
| **← →** | Adjust crossfader |
| **Shift + Scroll** | Adjust crossfader with mouse |
| **Enter** | Search (in search box) / Load video (in a deck's link field) |
| **ESC** | Close modal |

## Technologies

- HTML5, CSS3, JavaScript (ES6)
- YouTube IFrame Player API
- PHP backend for secure API key storage
- Invidious API as a keyless search fallback

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

**Rafael Beznos**

[LinkedIn](https://www.linkedin.com/in/rafaelbeznos) | [Instagram](https://www.instagram.com/oceanicaos.art) | [Live Demo](https://youtubemixer.online)

