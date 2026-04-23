<?php
require_once 'api/php/db.php';
require_once 'api/php/fetch.php';

echo "Running aggregation test...\n";

// Mock detection test
$tests = [
    ['title' => 'Explosion hit hotel in Dubai', 'desc' => 'Casualties reported after missile attack'],
    ['title' => 'New terminal opening at Heathrow', 'desc' => 'More gates for international flights'],
    ['title' => 'Travel guide to Thailand and Bali', 'desc' => 'Best places to visit this summer'],
    ['title' => 'London tourism rises by 20%', 'desc' => 'City welcomes more visitors']
];

foreach ($tests as $t) {
    $cat = detectCategory($t['title'], $t['desc'], 'Travel News');
    echo "Title: " . $t['title'] . "\nCategory: " . $cat . "\n---\n";
}

echo "Starting full fetch...\n";
$saved = fetchAllNews();
echo "Saved $saved articles.\n";

// Check if any articles exist for the new categories in the database
echo "\nCategory counts in DB:\n";
$categories = ['Breaking News', 'Airport News', 'Popular Destinations', 'Major Cities', 'Travel News'];
foreach ($categories as $cat) {
    $res = turso_query("SELECT COUNT(*) as total FROM articles WHERE category = ?", [$cat]);
    $count = clean_rows($res)[0]['total'] ?? 0;
    echo "$cat: $count\n";
}
?>
