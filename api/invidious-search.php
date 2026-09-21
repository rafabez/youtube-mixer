<?php
/**
 * Invidious Search API Endpoint (Free Software Alternative)
 *
 * Searches through public Invidious instances instead of the YouTube Data API:
 * no API key, no quota, no Google tracking. The frontend uses it as a fallback
 * when YouTube search fails. Public instances come and go, so after the
 * configured ones it tries instances with the API enabled from api.invidious.io.
 *
 * Output uses the same shape as youtube-search.php.
 *
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

require_once __DIR__ . '/common.php';

start_json_endpoint();
$query = get_search_query();

$cacheKey = 'invidious:' . MAX_RESULTS . ':' . strtolower($query);
$cached = cache_get($cacheKey);
if ($cached !== null) {
    header('X-Cache: HIT');
    json_ok($cached);
}

$params = [
    'q' => $query,
    'type' => SEARCH_TYPE,
];
if (SEARCH_SORT !== '') {
    $params['sort'] = SEARCH_SORT;
}
if (SEARCH_DURATION !== '') {
    $params['duration'] = SEARCH_DURATION;
}
if (SEARCH_FEATURES !== '') {
    $params['features'] = SEARCH_FEATURES;
}

list($videos, $usedInstance, $tried) = invidious_get('/api/v1/search', $params, function ($data) {
    return array_is_list($data);
});

if ($videos === null) {
    json_error(502, 'All Invidious instances are unavailable', [
        'message' => 'Please try again later.',
        'tried' => $tried
    ]);
}

// Keep only videos and transform to match the YouTube API format
$items = [];
foreach ($videos as $video) {
    if (($video['type'] ?? '') !== 'video' || !is_video_id($video['videoId'] ?? null)) {
        continue;
    }
    $items[] = invidious_video_item($video);

    if (count($items) >= MAX_RESULTS) {
        break;
    }
}

$result = [
    'kind' => 'youtube#searchListResponse',
    'items' => $items,
    'source' => 'invidious',
    'instance' => $usedInstance
];

cache_set($cacheKey, $result);
header('X-Cache: MISS');
json_ok($result);
