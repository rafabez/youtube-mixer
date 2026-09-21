# API Directory

Server-side search proxy for the mixer.

## Setup

1. Copy `.env.example` to `.env`
2. Add your YouTube API key to `.env`:
   ```
   YOUTUBE_API_KEY=your_key_here
   ```
   Without a key, search still works through Invidious.

## Files

- **`.env`** - Your settings and API key (never commit!)
- **`.env.example`** - Template for `.env` with all options
- **`config.php`** - Loads settings from the environment / `.env`
- **`common.php`** - Shared helpers: CORS, request parsing, HTTP and file cache
- **`youtube-search.php`** - YouTube Data API search endpoint (cached)
- **`invidious-search.php`** - Invidious search endpoint, used by the frontend when YouTube search fails
- **`.htaccess`** - Security rules

## Security

The `.htaccess` file blocks direct web access to `.env`, `.env.example`, `config.php` and `common.php`.
