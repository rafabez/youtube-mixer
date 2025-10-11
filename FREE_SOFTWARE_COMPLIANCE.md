# Free Software Compliance Guide

This document explains how to make YouTube Mixer fully compliant with Free Software principles using Invidious.

## Current Status

✅ **Source Code:** Available under MIT License  
✅ **Source Download Link:** Added to `script.js`  
✅ **License Metadata:** LibreJS compatible headers  
⚠️ **Privacy:** Uses YouTube API (Google tracking)  

## Invidious Integration (Privacy-Respecting Alternative)

### What is Invidious?

[Invidious](https://invidious.io/) is a Free Software, privacy-respecting frontend for YouTube that:
- ✅ No Google tracking or ads
- ✅ No JavaScript required for basic functionality
- ✅ Open source (AGPLv3)
- ✅ Self-hostable
- ✅ Public instances available

### Benefits

1. **Privacy:** No tracking, no Google Analytics, no ads
2. **Freedom:** Fully open source, self-hostable
3. **No API Key Required:** Uses public Invidious instances
4. **No Quota Limits:** No daily request limits
5. **Ethical:** Aligns with Free Software philosophy

---

## How to Switch to Invidious

### Option 1: Use Invidious for Search Only (Recommended)

This keeps YouTube IFrame API for video playback (better compatibility) but uses Invidious for search (better privacy).

**Step 1:** Rename configuration files

```bash
# Backup current config
mv api/config.php api/config-youtube.php.bak

# Use Invidious config
cp api/config-invidious.php api/config.php
```

**Step 2:** Update search endpoint in `script.js`

Change line 54 from:
```javascript
const response = await fetch(`api/youtube-search.php?q=${encodeURIComponent(query)}`);
```

To:
```javascript
const response = await fetch(`api/invidious-search.php?q=${encodeURIComponent(query)}`);
```

**Step 3:** Upload files and test

✅ **Pros:** Best compatibility, no API key needed, privacy-respecting search  
⚠️ **Note:** Video playback still uses YouTube (but no tracking during search)

---

### Option 2: Full Invidious Integration (Maximum Privacy)

Use Invidious for both search AND video playback.

**⚠️ Important Limitations:**
- Invidious embed doesn't support YouTube IFrame API features
- No programmatic playback control (play/pause/stop buttons won't work)
- Audio mixing may not work properly
- Less stable than YouTube embeds

**Not recommended for this project** due to the need for programmatic video control.

---

## Choosing an Invidious Instance

### Public Instances

List of public instances: https://docs.invidious.io/instances/

**Recommended instances (as of 2025):**
- `https://inv.nadeko.net` (Default in config)
- `https://invidious.fdn.fr`
- `https://invidious.privacydev.net`
- `https://iv.nboeck.de`

**How to change:**

Edit `api/config-invidious.php`:
```php
define('INVIDIOUS_INSTANCE', 'https://your-preferred-instance.com');
```

### Self-Hosting Invidious

For maximum control and privacy, you can self-host Invidious:

**Requirements:**
- VPS or dedicated server
- Docker or manual installation
- Domain name (optional)

**Documentation:** https://docs.invidious.io/installation/

**Benefits:**
- Full control over instance
- No reliance on public instances
- Better uptime guarantee
- Can customize settings

---

## Implementation Details

### File Structure

```
youtube-mixer/
├── api/
│   ├── config.php              # Current config (YouTube or Invidious)
│   ├── config-youtube.php      # YouTube API config (original)
│   ├── config-invidious.php    # Invidious config (new)
│   ├── youtube-search.php      # YouTube search endpoint
│   └── invidious-search.php    # Invidious search endpoint (new)
└── script.js                   # Frontend (with source download link)
```

### API Compatibility

The `invidious-search.php` endpoint transforms Invidious API responses to match YouTube API format, so the frontend code remains unchanged.

**Invidious API Response:**
```json
{
  "type": "video",
  "title": "Video Title",
  "videoId": "abc123",
  "author": "Channel Name",
  "videoThumbnails": [...]
}
```

**Transformed to YouTube API Format:**
```json
{
  "videoId": "abc123",
  "snippet": {
    "title": "Video Title",
    "channelTitle": "Channel Name",
    "thumbnails": {...}
  }
}
```

---

## LibreJS Compliance

The project is already LibreJS compliant with:

```javascript
// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt MIT
// @source https://github.com/rafabez/youtube-mixer
// @source-download https://github.com/rafabez/youtube-mixer/archive/refs/heads/main.zip
```

This allows LibreJS browser extension to recognize the code as Free Software.

**Test with LibreJS:**
1. Install LibreJS extension: https://www.gnu.org/software/librejs/
2. Visit your website
3. Check that JavaScript is allowed (green icon)

---

## Privacy Comparison

| Feature | YouTube API | Invidious |
|---------|-------------|-----------|
| **Search Tracking** | ❌ Yes (Google) | ✅ No |
| **API Key Required** | ❌ Yes | ✅ No |
| **Quota Limits** | ⚠️ 100/day | ✅ Unlimited |
| **Video Playback Tracking** | ❌ Yes | ⚠️ Depends* |
| **Programmatic Control** | ✅ Full | ❌ Limited |
| **Stability** | ✅ High | ⚠️ Variable |

*If using YouTube IFrame API for playback, tracking still occurs during playback

---

## Recommended Configuration

### For Maximum Privacy (Search Only)

```php
// api/config-invidious.php
define('INVIDIOUS_INSTANCE', 'https://inv.nadeko.net');
define('USE_INVIDIOUS_EMBED', false); // Keep YouTube for playback
```

Update `script.js` line 54 to use `invidious-search.php`

**Result:**
- ✅ Privacy-respecting search (no Google tracking)
- ✅ Full playback control (YouTube IFrame API)
- ✅ No API key required
- ✅ No quota limits
- ⚠️ Video playback still uses YouTube

### For Maximum Compatibility (Current Setup)

```php
// api/config.php (YouTube)
define('YOUTUBE_API_KEY', 'your-key');
```

**Result:**
- ✅ Full functionality
- ✅ Stable and reliable
- ❌ Requires API key
- ❌ Google tracking
- ❌ Quota limits

---

## Testing Invidious Integration

### Test Search Endpoint

```bash
# Test Invidious search
curl "https://youtubemixer.com.br/api/invidious-search.php?q=music"
```

Expected response: JSON with video results

### Test in Browser

1. Update `script.js` to use `invidious-search.php`
2. Upload to server
3. Search for "music"
4. Check browser console for errors
5. Verify results display correctly

---

## Troubleshooting

### Problem: "Failed to connect to Invidious instances"

**Cause:** All configured instances are down or unreachable

**Solution:**
1. Check instance status: https://docs.invidious.io/instances/
2. Update `INVIDIOUS_INSTANCE` in config
3. Add more fallback instances

### Problem: Slow search results

**Cause:** Public instance is overloaded

**Solution:**
1. Try different instance
2. Consider self-hosting
3. Implement caching (already in config)

### Problem: Missing thumbnails

**Cause:** Invidious instance proxy settings

**Solution:**
- Thumbnails are served directly from Invidious
- If missing, try different instance
- Check instance proxy settings

---

## Migration Checklist

- [ ] Backup current `api/config.php`
- [ ] Upload `api/config-invidious.php`
- [ ] Upload `api/invidious-search.php`
- [ ] Update `script.js` to use `invidious-search.php`
- [ ] Test search functionality
- [ ] Verify video loading works
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Update documentation

---

## Conclusion

**Recommended Approach:**

Use **Invidious for search** + **YouTube IFrame API for playback**

This provides:
- ✅ Privacy-respecting search (no Google tracking during search)
- ✅ Full functionality (all features work)
- ✅ No API key required
- ✅ No quota limits
- ✅ Better Free Software compliance

**Trade-off:**
- Video playback still uses YouTube (necessary for programmatic control)

---

## Resources

- **Invidious Documentation:** https://docs.invidious.io/
- **Invidious Instances:** https://docs.invidious.io/instances/
- **LibreJS:** https://www.gnu.org/software/librejs/
- **Free Software Definition:** https://www.gnu.org/philosophy/free-sw.html
- **Project Repository:** https://github.com/rafabez/youtube-mixer

---

**Last Updated:** 2025-10-11  
**License:** MIT (same as project)
