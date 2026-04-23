<?php
// Database & API Configuration
define('TURSO_URL', 'libsql://nomad-news-randompro.aws-us-east-1.turso.io');
define('TURSO_AUTH_TOKEN', 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQxMjI2NTQsImlkIjoiMDE5ZDExZjEtMGEwMS03ODcwLThkODMtZjIwMWNmNzExNzhiIiwicmlkIjoiNjlkZWNmNTEtZjg4Mi00OWVhLWE3ZmEtMTY5ZjAxMjQwOGU0In0.zCezOAqItpOP8SNTRJgPppO-SHz795-q_AAVpV_tgAZX2NVxHuJGRRilR0nvoXPztaM8tUSPw-udYgH69rI8Aw');
define('NEWS_API_KEY', '02a1bcc9fa3d68b5f758644d43980f74');

// Set error reporting for development (Disabling for production stability)
error_reporting(0);
ini_set('display_errors', 0);

// Standard CORS Headers for PHP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
?>
