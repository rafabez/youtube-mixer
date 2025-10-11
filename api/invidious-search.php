<?php
/**
 * Invidious Search API Endpoint (Free Software Alternative)
 * 
 * This endpoint uses Invidious API instead of YouTube Data API
 * for privacy-respecting search without Google tracking.
 * 
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

// Include configuration
require_once 'config.php';

// Set headers for CORS and JSON response
header('Content-Type: application/json');

// Handle CORS
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET and POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get search query
$query = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = isset($_GET['q']) ? trim($_GET['q']) : '';
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $query = isset($input['q']) ? trim($input['q']) : '';
}

// Validate query
if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Search query is required']);
    exit();
}

// Sanitize query
$query = htmlspecialchars($query, ENT_QUOTES, 'UTF-8');

// Build Invidious API URL
$params = [
    'q' => $query,
    'type' => SEARCH_TYPE,
];

// Add optional parameters
if (!empty(SEARCH_SORT)) {
    $params['sort'] = SEARCH_SORT;
}
if (!empty(SEARCH_DURATION)) {
    $params['duration'] = SEARCH_DURATION;
}
if (!empty(SEARCH_FEATURES)) {
    $params['features'] = SEARCH_FEATURES;
}

// Try primary instance first
$instances = array_merge([INVIDIOUS_INSTANCE], INVIDIOUS_FALLBACK_INSTANCES);
$response = false;
$lastError = '';

foreach ($instances as $instance) {
    $apiUrl = rtrim($instance, '/') . '/api/v1/search?' . http_build_query($params);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $lastError = curl_error($ch);
    curl_close($ch);
    
    // If successful, break the loop
    if ($response !== false && $httpCode === 200) {
        break;
    }
    
    // Otherwise, try next instance
    $response = false;
}

// Handle errors if all instances failed
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to connect to Invidious instances',
        'details' => $lastError,
        'message' => 'All Invidious instances are unavailable. Please try again later.'
    ]);
    exit();
}

// Parse response
$data = json_decode($response, true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid response from Invidious',
        'details' => 'Response is not valid JSON'
    ]);
    exit();
}

// Filter only videos and transform to match YouTube API format
$videos = array_filter($data, function($item) {
    return isset($item['type']) && $item['type'] === 'video';
});

// Limit results
$videos = array_slice($videos, 0, MAX_RESULTS);

// Transform Invidious format to match YouTube API format for compatibility
$transformedItems = array_map(function($video) {
    return [
        'videoId' => $video['videoId'],
        'id' => ['videoId' => $video['videoId']],
        'snippet' => [
            'title' => $video['title'],
            'description' => $video['description'] ?? '',
            'channelTitle' => $video['author'],
            'channelId' => $video['authorId'] ?? '',
            'publishedAt' => isset($video['published']) ? date('c', $video['published']) : '',
            'thumbnails' => [
                'default' => [
                    'url' => $video['videoThumbnails'][0]['url'] ?? '',
                    'width' => 120,
                    'height' => 90
                ],
                'medium' => [
                    'url' => $video['videoThumbnails'][1]['url'] ?? $video['videoThumbnails'][0]['url'] ?? '',
                    'width' => 320,
                    'height' => 180
                ],
                'high' => [
                    'url' => $video['videoThumbnails'][2]['url'] ?? $video['videoThumbnails'][0]['url'] ?? '',
                    'width' => 480,
                    'height' => 360
                ]
            ]
        ],
        // Additional Invidious-specific data
        'invidious' => [
            'viewCount' => $video['viewCount'] ?? 0,
            'lengthSeconds' => $video['lengthSeconds'] ?? 0,
            'liveNow' => $video['liveNow'] ?? false
        ]
    ];
}, $videos);

// Return response in YouTube API compatible format
http_response_code(200);
echo json_encode([
    'kind' => 'youtube#searchListResponse',
    'items' => array_values($transformedItems),
    'pageInfo' => [
        'totalResults' => count($transformedItems),
        'resultsPerPage' => MAX_RESULTS
    ],
    'source' => 'invidious',
    'instance' => INVIDIOUS_INSTANCE
]);
