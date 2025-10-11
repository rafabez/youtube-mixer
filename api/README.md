# API Directory

This directory contains the PHP backend for YouTube search functionality.

## Files

### `config.php`
- **Purpose:** Stores YouTube API key and configuration
- **Security:** Protected by `.htaccess` - cannot be accessed directly via browser
- **Important:** Never commit this file to public repositories with real API key

### `youtube-search.php`
- **Purpose:** API endpoint that handles YouTube search requests
- **Method:** GET or POST
- **Parameter:** `q` (search query)
- **Returns:** JSON response with YouTube video results

### `.htaccess`
- **Purpose:** Security rules for this directory
- **Features:**
  - Blocks direct access to `config.php`
  - Disables error display (logs errors instead)
  - Sets execution time limits

## Usage

### JavaScript Example
```javascript
const response = await fetch(`api/youtube-search.php?q=${encodeURIComponent(query)}`);
const data = await response.json();
```

### Direct Browser Test
```
https://youtubemixer.com.br/api/youtube-search.php?q=music
```

## Security

- API key is stored server-side only
- CORS protection limits allowed origins
- `.htaccess` prevents direct config access
- Input sanitization prevents XSS attacks

## Troubleshooting

**500 Error:**
- Check PHP error logs
- Verify cURL is enabled
- Check file permissions (644)

**CORS Error:**
- Verify domain in `ALLOWED_ORIGINS`
- Check HTTPS vs HTTP

**Empty Results:**
- Check API key validity
- Verify quota not exceeded
- Test with simple query like "test"
