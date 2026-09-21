<?php
/**
 * YouTube Mixer - Secure Configuration with Environment Variables
 * 
 * This configuration uses environment variables to store sensitive data
 * like API keys, making it safer for version control and deployment.
 * 
 * @license MIT
 * @source https://github.com/rafabez/youtube-mixer
 */

// ============================================
// MÉTODO 1: Usar variáveis de ambiente do servidor
// ============================================
// Se você configurou variáveis de ambiente no painel do Hostinger
// ou via .htaccess, elas serão lidas automaticamente

// Tenta ler a API key de variáveis de ambiente
$youtubeApiKey = getenv('YOUTUBE_API_KEY') ?: $_ENV['YOUTUBE_API_KEY'] ?? null;

// ============================================
// MÉTODO 2: Usar arquivo .env (recomendado)
// ============================================
// Se o arquivo .env existe, carrega as variáveis dele
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envFile as $line) {
        // Ignora comentários e linhas vazias
        if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
            continue;
        }
        
        // Parse a linha KEY=VALUE
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        
        // Remove aspas se existirem
        $value = trim($value, '"\'');
        
        // Define a variável de ambiente
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
    
    // Recarrega a API key após ler o .env
    $youtubeApiKey = getenv('YOUTUBE_API_KEY') ?: $_ENV['YOUTUBE_API_KEY'] ?? null;
}

// ============================================
// MÉTODO 3: Fallback para config.php (se existir)
// ============================================
// Se nenhuma variável de ambiente foi encontrada, tenta carregar do config.php antigo
if (empty($youtubeApiKey) && file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    if (defined('YOUTUBE_API_KEY')) {
        $youtubeApiKey = YOUTUBE_API_KEY;
    }
}

// ============================================
// Validação: API key deve existir
// ============================================
if (empty($youtubeApiKey)) {
    // Se nenhuma API key foi encontrada, retorna erro útil
    if (php_sapi_name() !== 'cli') {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'error' => 'API key not configured',
            'message' => 'Please configure YOUTUBE_API_KEY environment variable or create .env file',
            'instructions' => 'See ENVIRONMENT_SETUP.md for configuration instructions'
        ]);
        exit;
    } else {
        die("ERROR: YOUTUBE_API_KEY not configured. See ENVIRONMENT_SETUP.md\n");
    }
}

// Define constantes para uso no resto da aplicação
define('YOUTUBE_API_KEY', $youtubeApiKey);

// Outras configurações (com valores padrão se não definidos)
define('INVIDIOUS_INSTANCE', getenv('INVIDIOUS_INSTANCE') ?: $_ENV['INVIDIOUS_INSTANCE'] ?? 'https://inv.nadeko.net');
define('MAX_RESULTS', getenv('MAX_RESULTS') ?: $_ENV['MAX_RESULTS'] ?? 20);
define('APP_ENV', getenv('APP_ENV') ?: $_ENV['APP_ENV'] ?? 'production');

// Invidious fallback instances
define('INVIDIOUS_FALLBACK_INSTANCES', [
    'https://invidious.fdn.fr',
    'https://invidious.privacydev.net',
    'https://iv.nboeck.de',
    'https://invidious.lunar.icu'
]);

// Allowed origins for CORS
define('ALLOWED_ORIGINS', [
    'https://youtubemixer.online',
    'https://www.youtubemixer.online',
    'https://youtubemixer.69.62.117.27.sslip.io',
    'http://localhost',  // Para testes locais
    'http://127.0.0.1'   // Para testes locais
]);

// Cache duration (1 hour)
define('CACHE_DURATION', 3600);

// ============================================
// Logging (apenas em desenvolvimento)
// ============================================
if (APP_ENV === 'development') {
    error_log('YouTube Mixer Config Loaded:');
    error_log('- API Key: ' . (empty($youtubeApiKey) ? 'NOT SET' : 'SET (hidden)'));
    error_log('- Invidious: ' . INVIDIOUS_INSTANCE);
    error_log('- Max Results: ' . MAX_RESULTS);
    error_log('- Environment: ' . APP_ENV);
}
