# API Directory

## Setup

1. Copy `.env.example` to `.env`
2. Add your YouTube API key to `.env`:
   ```
   YOUTUBE_API_KEY=your_key_here
   ```
3. Upload all files to your server

## Files

- **`.env`** - Your API keys (never commit!)
- **`config.php`** - Configuration loader
- **`youtube-search.php`** - YouTube search endpoint
- **`invidious-search.php`** - Invidious search endpoint (privacy alternative)
- **`.htaccess`** - Security rules

## Security

The `.htaccess` file blocks direct access to:
- `.env` file
- `config.php` file

Never commit `.env` or `config.php` to Git!
