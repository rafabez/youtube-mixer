# Quick Switch to Invidious

## One-Line Change

To switch from YouTube API to Invidious, change **one line** in `script.js`:

### Current (YouTube API):
```javascript
// Line 54 in script.js
const response = await fetch(`api/youtube-search.php?q=${encodeURIComponent(query)}`);
```

### Change to (Invidious):
```javascript
// Line 54 in script.js
const response = await fetch(`api/invidious-search.php?q=${encodeURIComponent(query)}`);
```

## That's it!

✅ **No API key required**  
✅ **No quota limits**  
✅ **Privacy-respecting search**  
✅ **All features still work**  

## Files to Upload

Make sure these files are on your server:
- `api/config-invidious.php`
- `api/invidious-search.php`
- `script.js` (with the one-line change)

## Verify It Works

1. Go to your website
2. Search for "music"
3. Results should appear in modal
4. Click "Load in Deck A" - video should load
5. Check browser console - should see no errors

## Switch Back to YouTube

Just change line 54 back to:
```javascript
const response = await fetch(`api/youtube-search.php?q=${encodeURIComponent(query)}`);
```

## Why Invidious?

- 🔒 **Privacy:** No Google tracking
- 🆓 **Free:** No API key needed
- ♾️ **Unlimited:** No quota limits
- 🛡️ **Freedom:** Open source, self-hostable
- ✅ **Compatible:** Works with existing code

---

**Full documentation:** See `FREE_SOFTWARE_COMPLIANCE.md`
