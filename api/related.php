<?php
/**
 * Related Videos Endpoint (used by Auto Mix)
 *
 * Returns videos related to ?v=VIDEO_ID in the same shape as the search endpoints.
 * The YouTube Data API no longer offers related videos, so this uses Invidious
 * recommendations. If every Invidious instance fails, it falls back to a YouTube
 * search for the video's channel (costs ~101 quota units, so results are cached).
 *
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

require_once __DIR__ . '/common.php';

start_json_endpoint();

$videoId = $_GET['v'] ?? '';
if (!is_video_id($videoId)) {
    json_error(400, 'A valid video ID (?v=) is required');
}

$cacheKey = 'related:' . $videoId;
$cached = cache_get($cacheKey);
if ($cached !== null) {
    header('X-Cache: HIT');
    json_ok($cached);
}

$result = related_from_invidious($videoId) ?? related_from_youtube($videoId);

if ($result === null) {
    json_error(502, 'Could not find related videos', ['message' => 'Please try again later.']);
}

cache_set($cacheKey, $result);
header('X-Cache: MISS');
json_ok($result);

/**
 * Related videos from Invidious recommendations, or null if no instance answered.
 */
function related_from_invidious($videoId) {
    list($video, $instance) = invidious_get(
        '/api/v1/videos/' . $videoId,
        ['fields' => 'recommendedVideos'],
        function ($data) {
            return isset($data['recommendedVideos']) && is_array($data['recommendedVideos']);
        }
    );
    if ($video === null) {
        return null;
    }

    $items = [];
    foreach ($video['recommendedVideos'] as $recommended) {
        if (is_video_id($recommended['videoId'] ?? null)) {
            $items[] = invidious_video_item($recommended);
        }
    }
    if (!$items) {
        return null;
    }

    return ['items' => $items, 'source' => 'invidious', 'instance' => $instance];
}

/**
 * Fallback: other embeddable videos from the same channel via the YouTube Data API,
 * or null if the API key is missing or the requests fail.
 */
function related_from_youtube($videoId) {
    if (YOUTUBE_API_KEY === '') {
        return null;
    }

    // videos.list costs 1 unit: get the channel of the seed video
    list($httpCode, $response) = http_get('https://www.googleapis.com/youtube/v3/videos?' . http_build_query([
        'part' => 'snippet',
        'id' => $videoId,
        'key' => YOUTUBE_API_KEY
    ]));
    $data = $httpCode === 200 ? json_decode((string) $response, true) : null;
    $channelId = $data['items'][0]['snippet']['channelId'] ?? null;
    if (!$channelId) {
        return null;
    }

    // search.list costs 100 units
    list($httpCode, $response) = http_get('https://www.googleapis.com/youtube/v3/search?' . http_build_query([
        'part' => 'snippet',
        'type' => 'video',
        'channelId' => $channelId,
        'maxResults' => 25,
        'order' => 'viewCount',
        'videoEmbeddable' => 'true',
        'safeSearch' => 'moderate',
        'key' => YOUTUBE_API_KEY
    ]));
    $data = $httpCode === 200 ? json_decode((string) $response, true) : null;

    $items = [];
    foreach ($data['items'] ?? [] as $item) {
        $id = $item['id']['videoId'] ?? null;
        if (!is_video_id($id) || $id === $videoId) {
            continue;
        }
        $item['videoId'] = $id;
        // YouTube returns HTML-encoded text; the frontend escapes it itself
        foreach (['title', 'description', 'channelTitle'] as $field) {
            if (isset($item['snippet'][$field])) {
                $item['snippet'][$field] = html_entity_decode($item['snippet'][$field], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
        }
        $items[] = $item;
    }
    if (!$items) {
        return null;
    }

    return ['items' => $items, 'source' => 'youtube-channel'];
}
