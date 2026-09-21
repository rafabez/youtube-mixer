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

$instances = array_slice(invidious_instances(), 0, INVIDIOUS_MAX_ATTEMPTS);
$videos = null;
$usedInstance = null;

foreach ($instances as $instance) {
    list($httpCode, $response) = http_get($instance . '/api/v1/search?' . http_build_query($params), 6);
    $data = ($httpCode === 200 && $response !== false) ? json_decode($response, true) : null;

    // Instances with the API disabled often answer 200 with an HTML page, so check the shape
    if (is_array($data) && array_is_list($data)) {
        $videos = $data;
        $usedInstance = $instance;
        break;
    }
}

if ($videos === null) {
    json_error(502, 'All Invidious instances are unavailable', [
        'message' => 'Please try again later.',
        'tried' => $instances
    ]);
}

// Keep only videos and transform to match the YouTube API format
$items = [];
foreach ($videos as $video) {
    if (($video['type'] ?? '') !== 'video' || !is_video_id($video['videoId'] ?? null)) {
        continue;
    }
    $id = $video['videoId'];
    // Thumbnails come straight from YouTube's image CDN: instance thumbnail URLs are
    // sometimes relative or point to sizes that don't exist.
    $thumb = function ($name, $w, $h) use ($id) {
        return ['url' => "https://i.ytimg.com/vi/$id/$name.jpg", 'width' => $w, 'height' => $h];
    };

    $items[] = [
        'videoId' => $id,
        'id' => ['videoId' => $id],
        'snippet' => [
            'title' => $video['title'] ?? '',
            'description' => $video['description'] ?? '',
            'channelTitle' => $video['author'] ?? '',
            'channelId' => $video['authorId'] ?? '',
            'publishedAt' => isset($video['published']) ? date('c', $video['published']) : '',
            'thumbnails' => [
                'default' => $thumb('default', 120, 90),
                'medium' => $thumb('mqdefault', 320, 180),
                'high' => $thumb('hqdefault', 480, 360)
            ]
        ],
        // Additional Invidious-specific data
        'invidious' => [
            'viewCount' => $video['viewCount'] ?? 0,
            'lengthSeconds' => $video['lengthSeconds'] ?? 0,
            'liveNow' => $video['liveNow'] ?? false
        ]
    ];

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

/**
 * Instances to try, in order: configured instance, configured fallbacks, then
 * HTTPS instances with the API enabled from the public directory (cached 6 hours).
 */
function invidious_instances() {
    $list = array_merge([INVIDIOUS_INSTANCE], INVIDIOUS_FALLBACK_INSTANCES);

    $directory = cache_get('invidious:directory', 6 * 3600);
    if ($directory === null) {
        $directory = [];
        list($httpCode, $response) = http_get(INVIDIOUS_DIRECTORY_URL, 6);
        $data = ($httpCode === 200 && $response !== false) ? json_decode($response, true) : null;
        foreach (is_array($data) ? $data : [] as $entry) {
            $info = $entry[1] ?? [];
            if (($info['type'] ?? '') === 'https' && !empty($info['api']) && !empty($info['uri'])) {
                $directory[] = $info['uri'];
            }
        }
        if ($directory) {
            cache_set('invidious:directory', $directory);
        }
    }

    $list = array_map(function ($uri) {
        return rtrim($uri, '/');
    }, array_merge($list, $directory));

    return array_values(array_unique(array_filter($list)));
}
