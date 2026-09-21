<?php
/**
 * YouTube Mixer - Shared helpers for the search endpoints
 * (CORS, request parsing, JSON responses, HTTP and file cache).
 *
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

require_once __DIR__ . '/config.php';

/**
 * Sends CORS/JSON headers, answers preflight requests and rejects
 * methods other than GET/POST.
 */
function start_json_endpoint() {
    header('Content-Type: application/json');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Vary: Origin');
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
    if ($method !== 'GET' && $method !== 'POST') {
        json_error(405, 'Method not allowed');
    }
}

/**
 * Returns the search query from ?q= (GET) or {"q": ...} (POST).
 * The raw text is kept as-is: http_build_query() encodes it for the upstream API,
 * and the frontend escapes it before rendering.
 */
function get_search_query() {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $query = is_array($input) ? ($input['q'] ?? '') : '';
    } else {
        $query = $_GET['q'] ?? '';
    }

    $query = is_string($query) ? trim($query) : '';
    if ($query === '') {
        json_error(400, 'Search query is required');
    }
    // Cap at 200 characters (UTF-8 aware without needing mbstring)
    preg_match('/^.{0,200}/us', $query, $match);
    return $match[0] ?? substr($query, 0, 200);
}

/**
 * Sends a JSON error and stops.
 */
function json_error($status, $error, array $extra = []) {
    http_response_code($status);
    echo json_encode(['error' => $error] + $extra);
    exit();
}

/**
 * Sends a JSON success response and stops.
 */
function json_ok(array $data) {
    http_response_code(200);
    echo json_encode($data);
    exit();
}

/**
 * GET request with cURL. Returns [httpCode, body]; body is false on connection failure.
 */
function http_get($url, $timeout = 10) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_USERAGENT, 'youtube-mixer (+https://github.com/rafabez/youtube-mixer)');

    $body = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [$httpCode, $body];
}

/**
 * Returns the cached array for $key if it is younger than $maxAge seconds, else null.
 */
function cache_get($key, $maxAge = CACHE_DURATION) {
    if ($maxAge <= 0) {
        return null;
    }
    $file = cache_file($key);
    if (!is_file($file) || filemtime($file) < time() - $maxAge) {
        return null;
    }
    $data = json_decode((string) @file_get_contents($file), true);
    return is_array($data) ? $data : null;
}

/**
 * Stores an array in the cache. Failures are ignored: caching is an optimization.
 */
function cache_set($key, array $data) {
    if (!is_dir(CACHE_DIR) && !@mkdir(CACHE_DIR, 0700, true)) {
        return;
    }
    $file = cache_file($key);
    $tmp = $file . '.' . uniqid('', true) . '.tmp';
    if (@file_put_contents($tmp, json_encode($data)) !== false) {
        @rename($tmp, $file);
    }
}

function cache_file($key) {
    return CACHE_DIR . '/' . sha1($key) . '.json';
}

/**
 * True for a well-formed YouTube video ID.
 */
function is_video_id($id) {
    return is_string($id) && preg_match('/^[A-Za-z0-9_-]{11}$/', $id) === 1;
}
