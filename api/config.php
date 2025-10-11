<?php
/**
 * YouTube API Configuration
 * IMPORTANT: Keep this file secure and never commit to public repositories
 */

// YouTube Data API v3 Key
// IMPORTANT: If you get 403 errors, the API key restriction needs to be changed
// from "HTTP referrers" to "IP addresses" in Google Cloud Console
// See DEPLOYMENT_GUIDE.md for details
define('YOUTUBE_API_KEY', 'AIzaSyCitRhCXmHoJzLIllSF4HpYL7F3Ycgw06o');

// Allowed origins for CORS (your domain)
define('ALLOWED_ORIGINS', [
    'https://youtubemixer.com.br',
    'https://www.youtubemixer.com.br',
    'http://localhost',  // For local testing
    'http://127.0.0.1'   // For local testing
]);

// API Settings
// YouTube API allows max 50 results per request
// More results = better selection, but slower loading and more API quota usage
define('MAX_RESULTS', 30);  // Maximum search results to return (1-50)
define('CACHE_DURATION', 3600);  // Cache results for 1 hour (optional)
