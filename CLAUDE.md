# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DJ-style two-deck YouTube video mixer (live: https://youtubemixer.online; the old youtubemixer.com.br domain expired). Vanilla HTML/CSS/JS frontend plus a small PHP proxy for search. No build step, no package manager, no tests, no linter.

## Running locally

Search needs PHP (with cURL) serving the repo root, since the frontend calls `api/*.php` by relative path:

```
php -S localhost:8000
```

Then open http://localhost:8000. Playback/crossfading works from any static server; only search requires PHP plus a `YOUTUBE_API_KEY`. CORS in `api/config.php` (`ALLOWED_ORIGINS`) allows `http://localhost` and `http://127.0.0.1` without a port; same-origin requests from the PHP dev server don't need it.

## Deploying

`deploy/deploy.sh` pushes the site to the Hostinger VPS (69.62.117.27, SSH key `~/.ssh/d2deploy`) at `/srv/stacks/youtubemixer` and runs `docker compose up -d`. The stack is one `php:8.3-apache` container (Apache so `api/.htaccess` keeps working) behind the VPS-wide Traefik at `/srv/stacks/traefik`, which handles TLS via Let's Encrypt. Other projects share this VPS; don't touch their stacks.

- Hostnames are in the server-side `/srv/stacks/youtubemixer/.env` (`ROUTER_RULE`), created once from `deploy/.env.example` and never overwritten. Only add a hostname once its DNS resolves to the VPS, or the whole certificate fails. Test host: `youtubemixer.69.62.117.27.sslip.io`.
- `site/api/.env` (the YouTube key) exists only on the server; `deploy.sh` never ships or overwrites it.
- DNS is at Namecheap (not Hostinger).

## Architecture

- `index.html` — static markup: two decks (`#player1`, `#player2` with URL inputs `#videoLink1/2`), crossfader `#fader`, search box, info modal, search results modal. Uses inline `onclick` handlers that call global functions in `script.js`. Loads `script.js` first, then the YouTube IFrame API, which calls the global `onYouTubeIframeAPIReady()` to create `player1`/`player2`.
- `script.js` — all app logic as global functions/vars (no modules). Key pieces:
  - Crossfader uses constant-power panning: fader 0–100 → angle 0–π/2, `volume1 = cos`, `volume2 = sin`, applied via `player.setVolume()`.
  - Search: `searchVideos()` fetches `api/youtube-search.php?q=...`; an Invidious endpoint call is left commented out beside it for switching backends. Results render in the search modal; `loadVideoFromSearch(videoId, deck)` loads into a deck.
  - Keyboard shortcuts in `addKeyboardShortcuts()` (Q/W/E deck A, A/S/D deck B, arrows / Shift+scroll for fader, Enter search, Esc close modal).
- `api/` — PHP search proxy that keeps the API key server-side.
  - `config.php` loads config: server env vars → `api/.env` (KEY=VALUE, parsed manually) → defines constants (`YOUTUBE_API_KEY`, `INVIDIOUS_INSTANCE`, `MAX_RESULTS`, `APP_ENV`, `INVIDIOUS_FALLBACK_INSTANCES`, `ALLOWED_ORIGINS`, `CACHE_DURATION`). Returns a JSON 500 and exits if no API key is set.
  - `youtube-search.php` — calls YouTube Data API v3 `search` (embeddable, safeSearch moderate) and adds a top-level `videoId` to each item.
  - `invidious-search.php` — tries `INVIDIOUS_INSTANCE`, then the fallback instances. It references `SEARCH_TYPE`, `SEARCH_SORT`, `SEARCH_DURATION`, `SEARCH_FEATURES`, which `config.php` does **not** define, so this endpoint currently fails unless those constants are added.
  - `.htaccess` denies web access to `.env` and config files.
- `old/` — previous version kept for reference; gitignored (though some files are tracked). Don't edit unless asked.

## Notes

- Keep the MIT/LibreJS license header at the top of `script.js`.
- `api/config.php` is listed in `.gitignore` but is tracked. It holds no secrets (the key comes from env/`.env`), so edits to it do get committed.
- Comments in the PHP files are partly in Portuguese; keep that style when editing nearby.
