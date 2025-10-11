<?php
/**
 * Invidious API Configuration (Free Software Alternative)
 * 
 * This configuration uses Invidious instead of YouTube Data API
 * for better privacy and Free Software compliance.
 * 
 * Invidious is a privacy-respecting frontend for YouTube
 * Docs: https://docs.invidious.io/
 */

// Invidious Instance to use
// List of public instances: https://docs.invidious.io/instances/
define('INVIDIOUS_INSTANCE', 'https://inv.nadeko.net'); // Change to your preferred instance

// Alternative instances (fallback if primary fails):
define('INVIDIOUS_FALLBACK_INSTANCES', [
    'https://invidious.fdn.fr',
    'https://invidious.privacydev.net',
    'https://iv.nboeck.de',
    'https://invidious.lunar.icu'
]);

// Allowed origins for CORS (your domain)
define('ALLOWED_ORIGINS', [
    'https://youtubemixer.com.br',
    'https://www.youtubemixer.com.br',
    'http://localhost',  // For local testing
    'http://127.0.0.1'   // For local testing
]);

// API Settings
define('MAX_RESULTS', 20);  // Maximum search results to return (Invidious supports pagination)
define('CACHE_DURATION', 3600);  // Cache results for 1 hour (optional)

// Video Embedding Options
define('USE_INVIDIOUS_EMBED', false); // Set to true to use Invidious player instead of YouTube
// Note: Invidious embed may have limitations compared to YouTube IFrame API
// If true, videos will be embedded from Invidious instance
// If false, videos will use YouTube IFrame API (default)

// Search Filters (optional)
define('SEARCH_TYPE', 'video'); // 'video', 'playlist', 'channel', 'all'
define('SEARCH_SORT', 'relevance'); // 'relevance', 'rating', 'date', 'views'
define('SEARCH_DURATION', ''); // '', 'short', 'medium', 'long'
define('SEARCH_FEATURES', ''); // '', 'hd', 'subtitles', 'creative_commons', '4k', etc.
