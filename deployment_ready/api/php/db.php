<?php
require_once 'config.php';

function turso_query($sql, $args = []) {
    $url = str_replace('libsql://', 'https://', TURSO_URL) . '/v2/pipeline';
    
    // Format arguments for Turso REST API
    $formattedArgs = [];
    foreach ($args as $arg) {
        if (is_int($arg)) $formattedArgs[] = ["type" => "integer", "value" => (string)$arg];
        else if (is_bool($arg)) $formattedArgs[] = ["type" => "integer", "value" => $arg ? "1" : "0"];
        else $formattedArgs[] = ["type" => "text", "value" => (string)$arg];
    }

    $body = json_encode([
        "requests" => [
            [
                "type" => "execute",
                "stmt" => [
                    "sql" => $sql,
                    "args" => $formattedArgs
                ]
            ],
            ["type" => "close"]
        ]
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . TURSO_AUTH_TOKEN
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception("Turso Connection Error: " . $error);
    }

    $data = json_decode($response, true);
    if (isset($data['error'])) {
        throw new Exception("Turso API Error: " . $data['error']['message']);
    }

    $result = $data['results'][0]['response']['result'] ?? null;
    if (isset($data['results'][0]['error'])) {
        throw new Exception("Turso SQL Error: " . $data['results'][0]['error']['message']);
    }

    return $result;
}

// Convert Turso rows to clean associative arrays
function clean_rows($result) {
    if (!$result || !isset($result['cols']) || !isset($result['rows'])) return [];
    
    $cols = array_column($result['cols'], 'name');
    $rows = [];
    foreach ($result['rows'] as $row) {
        $cleanRow = [];
        foreach ($row as $i => $cell) {
            $cleanRow[$cols[$i]] = isset($cell['value']) ? $cell['value'] : null;
        }
        $rows[] = $cleanRow;
    }
    return $rows;
}
?>
