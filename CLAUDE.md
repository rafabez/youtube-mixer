# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DJ-style two-deck YouTube video mixer (live: https://youtubemixer.online; the old youtubemixer.com.br domain expired). Vanilla HTML/CSS/JS frontend plus a small PHP proxy for search. No build step, no package manager, no tests, no linter.

## Running locally

Search needs PHP (with cURL) serving the repo root, since the frontend calls `api/*.php` by relative path:

```
php -S localhost:8000
```

Then open http://localhost:8000. Playback/crossfading works from any static server; only search requires PHP. On Windows, PHP's cURL may lack a CA bundle, so outbound HTTPS (and thus search) fails locally; test API changes on the VPS instead (e.g. a throwaway `php:8.3-apache` container bound to `127.0.0.1`). The YouTube key is IP-restricted to the VPS, so YouTube search never works locally anyway. CORS in `api/config.php` (`ALLOWED_ORIGINS`) allows `http://localhost` and `http://127.0.0.1` without a port; same-origin requests from the PHP dev server don't need it.

## Deploying

`deploy/deploy.sh` pushes the site to the Hostinger VPS (69.62.117.27, SSH key `~/.ssh/d2deploy`) at `/srv/stacks/youtubemixer` and runs `docker compose up -d`. The stack is one `php:8.3-apache` container (Apache so `api/.htaccess` keeps working) behind the VPS-wide Traefik at `/srv/stacks/traefik`, which handles TLS via Let's Encrypt. Other projects share this VPS; don't touch their stacks.

- Hostnames are in the server-side `/srv/stacks/youtubemixer/.env` (`ROUTER_RULE`), created once from `deploy/.env.example` and never overwritten. Only add a hostname once its DNS resolves to the VPS, or the whole certificate fails. Test host: `youtubemixer.69.62.117.27.sslip.io`.
- `site/api/.env` (the YouTube key) exists only on the server; `deploy.sh` never ships or overwrites it.
- DNS is at Namecheap (not Hostinger).

## Architecture

- `index.html` — static markup: two decks (`#player1`, `#player2` with URL inputs `#videoLink1/2`), crossfader `#fader`, search box, info modal, search results modal. Uses inline `onclick` handlers that call global functions in `script.js`. Loads `script.js` first, then the YouTube IFrame API, which calls the global `onYouTubeIframeAPIReady()` to create `player1`/`player2`.
- `script.js` — all app logic as global functions/vars (no modules). Key pieces:
  - Crossfader uses constant-power panning: fader 0–100 → angle 0–π/2, `volume1 = cos`, `volume2 = sin`, applied via `player.setVolume()`.
  - Search: `searchVideos()` tries `api/youtube-search.php`, then falls back to `api/invidious-search.php` on any failure (e.g. quota exceeded). Both return the same YouTube-API-shaped JSON. Result buttons use `addEventListener`, not inline handlers.
  - Deck state lives in the `decks` object (videoId, volume trim, speed, cue). Every video load goes through `loadDeck()`. Player volume = crossfader gain × deck trim, set in `applyVolumes()`. `decks` and the fader are saved to `localStorage` (`youtubeMixerState`) and restored on load, before the YouTube API initializes.
  - YouTube ignores `setPlaybackRate` before a video loads, so speed is re-applied in `onStateChange`.
  - Keyboard shortcuts in `addKeyboardShortcuts()` (Q/W/E/R deck A, A/S/D/F deck B with Shift+R/F to set cue, arrows / Shift+scroll for fader, Enter search or load, Esc close modal).
- `api/` — PHP search proxy that keeps the API key server-side.
  - `config.php` loads `api/.env` into the environment (server env vars win) and defines constants. All options are documented in `api/.env.example`. A missing YouTube key is not fatal.
  - `common.php` — shared by both endpoints: CORS, query parsing (raw text, capped at 200 chars; no HTML-escaping), JSON responses, `http_get()`, and a file cache in `sys_get_temp_dir()` (the site is mounted read-only in Docker, so the cache lives in the container's `/tmp` and resets on restart). Avoid `mb_*` functions; mbstring isn't guaranteed everywhere.
  - `youtube-search.php` — YouTube Data API v3 `search` (embeddable, safeSearch moderate), cached for `CACHE_DURATION`. It decodes the HTML entities YouTube puts in titles, because the frontend escapes text itself.
  - `invidious-search.php` — tries `INVIDIOUS_INSTANCE`, then `INVIDIOUS_FALLBACK_INSTANCES`, then API-enabled instances from `api.invidious.io` (cached 6h), up to `INVIDIOUS_MAX_ATTEMPTS`. Public instances often disable their API or vanish, so don't rely on hardcoded lists. Thumbnails are built from `i.ytimg.com` rather than taken from the instance.
  - `.htaccess` denies web access to `.env*`, `config.php` and `common.php`. New include-only PHP files must be added to its `FilesMatch`, and new deployable files to the list in `deploy/deploy.sh`.
- `old/` — previous version kept for reference; gitignored (though some files are tracked). Don't edit unless asked.

## Notes

- Keep the MIT/LibreJS license header at the top of `script.js`.
- `api/config.php` is listed in `.gitignore` but is tracked. It holds no secrets (the key comes from env/`.env`), so edits to it do get committed.
- Comments in the PHP files are partly in Portuguese; keep that style when editing nearby.
