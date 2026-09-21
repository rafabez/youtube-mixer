<?php
/**
 * YouTube Mixer - Configuration
 *
 * Settings come from server environment variables or from api/.env
 * (see api/.env.example). Nothing secret lives in this file.
 *
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

// ============================================
// Carrega api/.env (se existir) para o ambiente
// ============================================
// Variáveis já definidas no servidor (painel ou SetEnv no .htaccess) têm prioridade.
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envFile as $line) {
        $line = trim($line);
        // Ignora comentários e linhas sem '='
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        // Remove aspas se existirem
        $value = trim(trim($value), '"\'');

        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

/**
 * Reads a setting from the environment, falling back to a default.
 */
function env_value($key, $default = '') {
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

// ============================================
// YouTube Data API
// ============================================
// Pode ficar vazio: youtube-search.php responde com erro e o frontend usa o Invidious.
define('YOUTUBE_API_KEY', env_value('YOUTUBE_API_KEY'));
define('MAX_RESULTS', max(1, min(50, (int) env_value('MAX_RESULTS', 20))));
define('APP_ENV', env_value('APP_ENV', 'production'));

// ============================================
// Invidious (alternativa sem chave de API)
// ============================================
// Instância preferida; se falhar, tenta INVIDIOUS_FALLBACK_INSTANCES e depois
// as instâncias com API ativa listadas em api.invidious.io.
define('INVIDIOUS_INSTANCE', env_value('INVIDIOUS_INSTANCE', 'https://invidious.f5.si'));
define('INVIDIOUS_FALLBACK_INSTANCES', array_values(array_filter(array_map('trim',
    explode(',', env_value('INVIDIOUS_FALLBACK_INSTANCES', ''))
))));
define('INVIDIOUS_DIRECTORY_URL', 'https://api.invidious.io/instances.json?sort_by=health');
// Máximo de instâncias tentadas por busca (cada uma pode levar até o timeout)
define('INVIDIOUS_MAX_ATTEMPTS', 4);

// Search filters (see https://docs.invidious.io/api/#get-apiv1search)
define('SEARCH_TYPE', 'video');
define('SEARCH_SORT', env_value('SEARCH_SORT', 'relevance'));   // relevance, rating, upload_date, view_count
define('SEARCH_DURATION', env_value('SEARCH_DURATION', ''));    // short, medium, long
define('SEARCH_FEATURES', env_value('SEARCH_FEATURES', ''));    // e.g. hd,subtitles

// ============================================
// Cache e CORS
// ============================================
// Search results are cached to save YouTube quota (each search costs 100 of 10,000 daily units).
define('CACHE_DURATION', (int) env_value('CACHE_DURATION', 3600));
define('CACHE_DIR', env_value('CACHE_DIR', sys_get_temp_dir() . '/youtubemixer-cache'));

// Allowed origins for CORS (same-origin requests don't need to be listed)
define('ALLOWED_ORIGINS', [
    'https://youtubemixer.online',
    'https://www.youtubemixer.online',
    'https://youtubemixer.69.62.117.27.sslip.io',
    'http://localhost',  // Para testes locais
    'http://127.0.0.1'   // Para testes locais
]);
