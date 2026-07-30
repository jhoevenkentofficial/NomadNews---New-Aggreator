<?php
// Database & API Configuration
// Keep secrets in the hosting environment when possible.
// On shared FTP hosting, create config.local.php beside this file and define the same constants there.
$localConfig = __DIR__ . '/config.local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
}

if (!defined('TURSO_URL')) define('TURSO_URL', getenv('TURSO_URL') ?: '');
if (!defined('TURSO_AUTH_TOKEN')) define('TURSO_AUTH_TOKEN', getenv('TURSO_AUTH_TOKEN') ?: '');
if (!defined('NEWS_API_KEY')) define('NEWS_API_KEY', getenv('NEWS_API_KEY') ?: '');
if (!defined('ADMIN_TOKEN')) define('ADMIN_TOKEN', getenv('ADMIN_TOKEN') ?: 'change_this_admin_secret');

// Production stability: log server errors, do not display them to visitors.
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
?>
