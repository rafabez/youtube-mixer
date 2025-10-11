<?php
/**
 * YouTube Search API Endpoint
 * Handles search requests and returns YouTube video results
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

// Build YouTube API URL
$apiUrl = 'https://www.googleapis.com/youtube/v3/search?' . http_build_query([
    'part' => 'snippet',
    'type' => 'video',
    'maxResults' => MAX_RESULTS,
    'q' => $query,
    'key' => YOUTUBE_API_KEY,
    'videoEmbeddable' => 'true',  // Only return embeddable videos
    'safeSearch' => 'moderate'
]);

// Make API request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to connect to YouTube API',
        'details' => $curlError
    ]);
    exit();
}

// Handle API errors
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo $response;  // Forward YouTube API error
    exit();
}

// Parse and enhance response
$data = json_decode($response, true);

// Add additional metadata if needed
if (isset($data['items']) && is_array($data['items'])) {
    foreach ($data['items'] as &$item) {
        // Extract video ID for easier access
        if (isset($item['id']['videoId'])) {
            $item['videoId'] = $item['id']['videoId'];
        }
    }
}

// Return successful response
http_response_code(200);
echo json_encode($data);
