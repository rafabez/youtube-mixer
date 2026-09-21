<?php
/**
 * YouTube Search API Endpoint
 * Proxies YouTube Data API v3 search so the API key stays on the server.
 * Results are cached for CACHE_DURATION seconds to save quota.
 *
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

require_once __DIR__ . '/common.php';

start_json_endpoint();
$query = get_search_query();

if (YOUTUBE_API_KEY === '') {
    json_error(503, 'YouTube API key not configured', [
        'message' => 'Set YOUTUBE_API_KEY in api/.env (see api/.env.example).'
    ]);
}

$cacheKey = 'youtube:' . MAX_RESULTS . ':' . strtolower($query);
$cached = cache_get($cacheKey);
if ($cached !== null) {
    header('X-Cache: HIT');
    json_ok($cached);
}

$apiUrl = 'https://www.googleapis.com/youtube/v3/search?' . http_build_query([
    'part' => 'snippet',
    'type' => 'video',
    'maxResults' => MAX_RESULTS,
    'q' => $query,
    'key' => YOUTUBE_API_KEY,
    'videoEmbeddable' => 'true',  // Only return embeddable videos
    'safeSearch' => 'moderate'
]);

list($httpCode, $response) = http_get($apiUrl);

if ($response === false) {
    json_error(502, 'Failed to connect to YouTube API');
}

$data = json_decode($response, true);

if ($httpCode !== 200 || !is_array($data)) {
    // e.g. "quotaExceeded" when the daily quota is used up; the frontend then falls back to Invidious
    $reason = $data['error']['errors'][0]['reason'] ?? 'unknown';
    json_error($httpCode >= 400 ? $httpCode : 502, 'YouTube API error', ['reason' => $reason]);
}

$items = [];
foreach ($data['items'] ?? [] as $item) {
    $videoId = $item['id']['videoId'] ?? null;
    if (!is_video_id($videoId)) {
        continue;
    }
    // Extract video ID for easier access
    $item['videoId'] = $videoId;
    // YouTube returns HTML-encoded text (e.g. "Rock n&#39; Roll"); the frontend escapes it itself
    foreach (['title', 'description', 'channelTitle'] as $field) {
        if (isset($item['snippet'][$field])) {
            $item['snippet'][$field] = html_entity_decode($item['snippet'][$field], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
    }
    $items[] = $item;
}

$result = [
    'kind' => 'youtube#searchListResponse',
    'items' => $items,
    'source' => 'youtube'
];

cache_set($cacheKey, $result);
header('X-Cache: MISS');
json_ok($result);
