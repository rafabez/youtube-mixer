# Quick Fix for 403 Error

## The Problem
You're getting: **"Search error: HTTP error! status: 403"**

This happens because your API key is restricted to **HTTP referrers** (websites), but the PHP backend makes server-side calls that need **IP address** restrictions instead.

---

## Quick Solution (2 options)

### Option A: Remove Restrictions (FASTEST - For Testing)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key: `AIzaSyCitRhCXmHoJzLIllSF4HpYL7F3Ycgw06o`
3. Under **"Application restrictions"**:
   - Select **"None"**
4. Click **"Save"**
5. Wait 1-2 minutes
6. Test your search again

✅ **Works immediately**  
⚠️ **Less secure** (anyone with your key can use it)

---

### Option B: Use IP Restriction (RECOMMENDED - More Secure)

**Step 1:** Get your server's IP address

1. Upload `api/get-server-ip.php` to your server
2. Visit: `https://youtubemixer.com.br/api/get-server-ip.php`
3. Copy the **"Outbound IP"** shown
4. Delete the file

**Step 2:** Update API key restrictions

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under **"Application restrictions"**:
   - Select **"IP addresses (web servers, cron jobs, etc.)"**
   - Click **"ADD AN ITEM"**
   - Paste your server's IP address
   - Click **"Done"**
4. Under **"API restrictions"**:
   - Keep "Restrict key" selected
   - Ensure "YouTube Data API v3" is checked
5. Click **"Save"**
6. Wait 1-2 minutes
7. Test your search again

✅ **Secure**  
✅ **Best practice**

---

## How to Test

After making changes:

1. Clear your browser cache (Ctrl+F5)
2. Go to: `https://youtubemixer.com.br`
3. Enter a search term (e.g., "music")
4. Click "Search"
5. Modal should open with results

---

## Still Not Working?

Check the browser console (F12) for errors:

- **403 error** = API key restriction issue (follow steps above)
- **500 error** = Server/PHP issue (check PHP error logs)
- **CORS error** = Domain mismatch in `config.php`

---

## Summary

**The fix:** Change API key restriction from "HTTP referrers" to either:
- **"None"** (quick test)
- **"IP addresses"** (recommended)

**Why:** PHP backend calls come from server IP, not from browser/domain.
