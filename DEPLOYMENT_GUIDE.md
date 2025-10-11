# YouTube Mixer - Search Modal Deployment Guide

## Overview
This guide covers deploying the new YouTube search modal feature to your Hostinger shared hosting.

## What's New
✅ **Search results now open in a modal** instead of a new tab  
✅ **Direct loading to Deck A or Deck B** from search results  
✅ **Secure API key storage** via PHP backend  
✅ **Beautiful card-based UI** with hover effects  
✅ **Keyboard support** (ESC to close modal)  

---

## File Structure

```
youtube-mixer/
├── index.html              (Updated - Added search modal)
├── styles.css              (Updated - Added search modal styles)
├── script.js               (Updated - New search functionality)
├── api/
│   ├── config.php          (NEW - API key storage)
│   ├── youtube-search.php  (NEW - Search endpoint)
│   └── .htaccess           (NEW - Security rules)
└── DEPLOYMENT_GUIDE.md     (This file)
```

---

## Deployment Steps for Hostinger

### Step 1: Upload Files via FTP/File Manager

1. **Connect to your Hostinger hosting:**
   - Use File Manager in hPanel, or
   - Use FTP client (FileZilla, WinSCP, etc.)

2. **Navigate to your public_html directory:**
   ```
   /home/username/public_html/
   ```

3. **Upload/Replace these files:**
   - `index.html` (replace existing)
   - `styles.css` (replace existing)
   - `script.js` (replace existing)

4. **Create the `api` directory:**
   ```
   /home/username/public_html/api/
   ```

5. **Upload NEW files to the `api` directory:**
   - `config.php`
   - `youtube-search.php`
   - `.htaccess`

### Step 2: Get Your Server's IP Address

**CRITICAL:** Your API key needs to be restricted by IP address (not HTTP referrer) because the PHP backend makes the API calls.

1. **Upload `get-server-ip.php` to your server:**
   ```
   /home/username/public_html/api/get-server-ip.php
   ```

2. **Access it in your browser:**
   ```
   https://youtubemixer.com.br/api/get-server-ip.php
   ```

3. **Copy the "Outbound IP" address shown**

4. **Delete the file after getting the IP** (for security)

### Step 3: Update Google Cloud API Key Restrictions

**This is the most important step!**

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Click on your API key** (the one starting with `AIzaSy...`)

3. **Update Application Restrictions:**
   - Select **"IP addresses (web servers, cron jobs, etc.)"**
   - Click "ADD AN ITEM"
   - Paste your server's IP address (from Step 2)
   - Click "Done"

4. **Keep API Restrictions:**
   - Ensure "Restrict key" is selected
   - Ensure "YouTube Data API v3" is checked

5. **Click "Save"**

6. **Wait 1-2 minutes** for changes to propagate

**Alternative (Quick Test Only):**
- Select "None" under Application restrictions
- ⚠️ Less secure, but works immediately for testing

### Step 4: Verify File Permissions

Ensure PHP files have correct permissions:
- `config.php` → 644 (rw-r--r--)
- `youtube-search.php` → 644 (rw-r--r--)
- `.htaccess` → 644 (rw-r--r--)

### Step 5: Test the API Endpoint

1. **Test the PHP endpoint directly:**
   ```
   https://youtubemixer.com.br/api/youtube-search.php?q=test
   ```

2. **Expected response:** JSON with YouTube search results

3. **If you get errors:**
   - Check PHP error logs in hPanel
   - Verify cURL is enabled (should be by default on Hostinger)
   - Check file permissions

### Step 6: Test the Full Application

1. **Open your website:**
   ```
   https://youtubemixer.com.br
   ```

2. **Test search functionality:**
   - Enter a search term (e.g., "music")
   - Click "Search" button
   - Modal should open with results
   - Hover over a video to see "Load in Deck A/B" buttons
   - Click a button to load the video

3. **Test keyboard shortcuts:**
   - Press ESC to close the modal
   - Press ENTER in search box to trigger search

---

## Security Considerations

### ✅ Already Implemented

1. **API Key Restrictions:**
   - Your API key is restricted to `https://youtubemixer.com.br`
   - Requests from other domains will be rejected by Google

2. **Server-Side Storage:**
   - API key is stored in `config.php` (server-side)
   - Never exposed to client browsers

3. **CORS Protection:**
   - PHP backend only accepts requests from allowed origins
   - Configured in `config.php`

4. **File Access Protection:**
   - `.htaccess` prevents direct access to `config.php`

### 🔒 Additional Security (Optional)

If you want to add rate limiting to prevent abuse:

**Edit `api/youtube-search.php`** and add this at the top:

```php
// Simple rate limiting (10 searches per minute per IP)
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$limit = 10;
$timeframe = 60; // seconds

if (!isset($_SESSION['search_count'])) {
    $_SESSION['search_count'] = [];
}

$now = time();
$_SESSION['search_count'] = array_filter(
    $_SESSION['search_count'],
    function($timestamp) use ($now, $timeframe) {
        return ($now - $timestamp) < $timeframe;
    }
);

if (count($_SESSION['search_count']) >= $limit) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please wait.']);
    exit();
}

$_SESSION['search_count'][] = $now;
```

---

## Troubleshooting

### Problem: "Search error: HTTP error! status: 403" (MOST COMMON)

**This is the error you're seeing in the screenshot!**

**Cause:** API key is restricted to HTTP referrers (domains), but PHP backend calls need IP restriction.

**Solution:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key
3. Change "Application restrictions" from "HTTP referrers" to **"IP addresses"**
4. Add your server's IP (use `get-server-ip.php` to find it)
5. Save and wait 1-2 minutes

**Quick Test (Temporary):**
- Set Application restrictions to "None"
- This will work immediately but is less secure
- Use only for testing, then add IP restriction

### Problem: "Search failed" error

**Possible causes:**
1. PHP cURL not enabled
2. API key invalid or quota exceeded
3. File permissions incorrect

**Solutions:**
- Check PHP error logs in hPanel
- Verify API key in Google Cloud Console
- Check quota usage: https://console.cloud.google.com

### Problem: Modal doesn't open

**Possible causes:**
1. JavaScript error
2. Files not uploaded correctly

**Solutions:**
- Open browser console (F12) and check for errors
- Verify all files are uploaded
- Clear browser cache (Ctrl+F5)

### Problem: CORS errors

**Possible causes:**
1. Domain mismatch in `config.php`
2. HTTPS vs HTTP mismatch

**Solutions:**
- Verify `ALLOWED_ORIGINS` in `config.php` matches your domain exactly
- Ensure you're using HTTPS (not HTTP)

### Problem: Videos don't load after clicking button

**Possible causes:**
1. YouTube player not initialized
2. Video ID extraction issue

**Solutions:**
- Check browser console for errors
- Verify YouTube IFrame API is loading
- Test with a different video

---

## API Quota Management

### Free Tier Limits
- **10,000 units per day**
- Each search = 100 units
- **= 100 searches per day**

### Monitor Usage
1. Go to: https://console.cloud.google.com
2. Navigate to: APIs & Services → Dashboard
3. Select: YouTube Data API v3
4. View quota usage

### If You Exceed Quota
- Searches will fail until quota resets (midnight Pacific Time)
- Consider implementing caching (optional)
- Upgrade to paid tier if needed (unlikely for personal use)

---

## Testing Checklist

- [ ] Files uploaded to correct directories
- [ ] API endpoint responds: `https://youtubemixer.com.br/api/youtube-search.php?q=test`
- [ ] Search button opens modal
- [ ] Search results display correctly
- [ ] Hover shows "Load in Deck A/B" buttons
- [ ] Clicking button loads video in correct deck
- [ ] ESC key closes modal
- [ ] Enter key in search box triggers search
- [ ] Mobile responsive (test on phone)

---

## Rollback Plan

If something goes wrong, you can revert to the old version:

1. **Restore old files from `old/` directory** (if you backed them up)
2. **Or remove the search modal:**
   - Delete the `api/` directory
   - Replace `script.js` with old version that opens new tab

---

## Support

If you encounter issues:

1. **Check browser console** (F12 → Console tab)
2. **Check PHP error logs** (hPanel → Error Logs)
3. **Verify API key** in Google Cloud Console
4. **Test API endpoint directly** in browser

---

## Future Enhancements (Optional)

- [ ] Add video duration to search results
- [ ] Add view count to search results
- [ ] Implement search result caching
- [ ] Add pagination for more results
- [ ] Add filters (upload date, duration, etc.)
- [ ] Add search history

---

**Deployment Date:** _____________________  
**Deployed By:** _____________________  
**Status:** ⬜ Success  ⬜ Issues (describe below)

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
