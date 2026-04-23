<?php
require_once 'db.php';

$route = isset($_GET['route']) ? $_GET['route'] : 'latest';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 18;
$offset = ($page - 1) * $limit;

try {
    switch ($route) {
        case 'health':
            $counts = [];
            $categories = ['Breaking News', 'Airport News', 'Popular Destinations', 'Major Cities', 'Travel News'];
            foreach ($categories as $cat) {
                $res = turso_query("SELECT COUNT(*) as total FROM articles WHERE category = ?", [$cat]);
                $counts[$cat] = (int)(clean_rows($res)[0]['total'] ?? 0);
            }
            $resTotal = turso_query("SELECT COUNT(*) as total FROM articles");
            $counts['Total'] = (int)(clean_rows($resTotal)[0]['total'] ?? 0);
            
            echo json_encode(['status' => 'ok', 'db' => 'turso', 'server' => 'php', 'counts' => $counts]);
            break;
            
        case 'fetch':
            // Capture output to prevent breaking JSON response
            ob_start();
            require_once 'fetch.php';
            $output = ob_get_clean();
            echo json_encode(['status' => 'success', 'message' => 'News fetch triggered', 'details' => $output]);
            break;

        case 'latest':
            $res = turso_query("SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?", [$limit, $offset]);
            $countRes = turso_query("SELECT COUNT(*) as count FROM articles");
            $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);
            
            echo json_encode([
                'articles' => clean_rows($res),
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit),
                    'totalArticles' => $total
                ]
            ]);
            break;

        case 'category':
            $cat = $_GET['category'] ?? '';
            $catSearch = str_replace('-', ' ', $cat);
            $pattern = "%" . strtolower($catSearch) . "%";
            
            if (strtolower($catSearch) === 'major cities') {
                // For Major Cities, search category OR if it's Breaking News with city keywords
                $sql = "SELECT * FROM articles WHERE LOWER(category) LIKE ? 
                        OR (LOWER(category) = 'breaking news' AND (LOWER(title) LIKE '%paris%' OR LOWER(title) LIKE '%london%' OR LOWER(title) LIKE '%dubai%' OR LOWER(title) LIKE '%singapore%' OR LOWER(title) LIKE '%tokyo%' OR LOWER(title) LIKE '%manila%' OR LOWER(title) LIKE '%bangkok%'))
                        ORDER BY published_at DESC LIMIT ? OFFSET ?";
                $res = turso_query($sql, [$pattern, $limit, $offset]);
                
                $countSql = "SELECT COUNT(*) as count FROM articles WHERE LOWER(category) LIKE ? 
                             OR (LOWER(category) = 'breaking news' AND (LOWER(title) LIKE '%paris%' OR LOWER(title) LIKE '%london%' OR LOWER(title) LIKE '%dubai%' OR LOWER(title) LIKE '%singapore%' OR LOWER(title) LIKE '%tokyo%' OR LOWER(title) LIKE '%manila%' OR LOWER(title) LIKE '%bangkok%'))";
                $countRes = turso_query($countSql, [$pattern]);
            } else {
                $res = turso_query("SELECT * FROM articles WHERE LOWER(category) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?", [$pattern, $limit, $offset]);
                $countRes = turso_query("SELECT COUNT(*) as count FROM articles WHERE LOWER(category) LIKE ?", [$pattern]);
            }
            $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);
            
            echo json_encode([
                'articles' => clean_rows($res),
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit) ?: 1,
                    'totalArticles' => $total
                ]
            ]);
            break;

        case 'region':
            $reg = strtolower($_GET['region'] ?? '');
            $pattern = "%$reg%";
            $res = turso_query("SELECT * FROM articles WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?", [$pattern, $pattern, $pattern, $limit, $offset]);
            $countRes = turso_query("SELECT COUNT(*) as count FROM articles WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ?", [$pattern, $pattern, $pattern]);
            $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);
            
            echo json_encode([
                'articles' => clean_rows($res),
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit) ?: 1,
                    'totalArticles' => $total
                ]
            ]);
            break;

        case 'trending':
            $res = turso_query("SELECT * FROM articles WHERE trending = 1 ORDER BY published_at DESC LIMIT 10");
            $rows = clean_rows($res);
            if (empty($rows)) {
                $res = turso_query("SELECT * FROM articles ORDER BY published_at DESC LIMIT 10");
                $rows = clean_rows($res);
            }
            echo json_encode(['articles' => $rows]);
            break;

        case 'source':
            $src = $_GET['source'] ?? '';
            $pattern = "%$src%";
            $res = turso_query("SELECT * FROM articles WHERE source LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?", [$pattern, $limit, $offset]);
            $countRes = turso_query("SELECT COUNT(*) as count FROM articles WHERE source LIKE ?", [$pattern]);
            $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);
            
            echo json_encode([
                'articles' => clean_rows($res),
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit) ?: 1,
                    'totalArticles' => $total
                ]
            ]);
            break;

        case 'sources':
            $res = turso_query("SELECT DISTINCT source, region FROM articles ORDER BY region, source");
            $rows = clean_rows($res);
            $grouped = [];
            foreach ($rows as $r) {
                $grouped[$r['region']][] = $r['source'];
            }
            echo json_encode($grouped);
            break;

        case 'search':
            $q = $_GET['q'] ?? '';
            $pattern = "%$q%";
            $res = turso_query("SELECT * FROM articles WHERE title LIKE ? OR description LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?", [$pattern, $pattern, $limit, $offset]);
            $countRes = turso_query("SELECT COUNT(*) as count FROM articles WHERE title LIKE ? OR description LIKE ?", [$pattern, $pattern]);
            $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);
            
            echo json_encode([
                'articles' => clean_rows($res),
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($total / $limit) ?: 1,
                    'totalArticles' => $total
                ]
            ]);
            break;

        case 'article':
            $id = $_GET['id'] ?? '';
            $res = turso_query("SELECT * FROM articles WHERE id = ?", [$id]);
            $rows = clean_rows($res);
            if (empty($rows)) {
                http_response_code(404);
                echo json_encode(['error' => 'Article not found']);
            } else {
                echo json_encode($rows[0]);
            }
            break;

        case 'diag':
            $total = clean_rows(turso_query("SELECT COUNT(*) as count FROM articles"))[0]['count'] ?? 0;
            $cats = clean_rows(turso_query("SELECT category, COUNT(*) as count FROM articles GROUP BY category"));
            $regionsRes = clean_rows(turso_query("SELECT region, COUNT(*) as count FROM articles GROUP BY region"));
            $recent = clean_rows(turso_query("SELECT title, source, category, region, published_at FROM articles ORDER BY published_at DESC LIMIT 10"));
            
            echo json_encode([
                'status' => 'success',
                'timestamp' => date('Y-m-d H:i:s'),
                'total_articles' => (int)$total,
                'category_distribution' => $cats,
                'region_distribution' => $regionsRes,
                'latest_10_articles' => $recent
            ]);
            break;

        case 'manual':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON body']);
                break;
            }
            $secret = $body['secret'] ?? '';
            if ($secret !== 'ttn_admin_2026') {
                http_response_code(403);
                echo json_encode(['error' => 'Invalid admin secret']);
                break;
            }
            $title  = trim($body['title'] ?? '');
            $url    = trim($body['url'] ?? '');
            $desc   = trim($body['description'] ?? '');
            $cat    = trim($body['category'] ?? 'Announcements');
            $image  = trim($body['image'] ?? '');
            $source = trim($body['source'] ?? 'TTN News');
            if (!$title) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                break;
            }
            // Generate a unique URL if none provided
            if (!$url) $url = 'ttn-manual-' . time() . '-' . rand(1000, 9999);
            if (!$image) $image = 'https://picsum.photos/seed/' . urlencode($title) . '/800/400';
            turso_query(
                "INSERT INTO articles (title, url, description, source, category, region, image, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [$title, $url, $desc, $source, $cat, 'Global', $image, date('Y-m-d H:i:s')]
            );
            echo json_encode(['message' => 'Article published successfully!']);
            break;

        case 'seed':
            $testTitle = "TTN Featured: Exploring the Heart of London";
            $testDesc = "Discover the hidden gems of London as we explore its most iconic travel destinations from the 100-city wishlist.";
            try {
                turso_query(
                    "INSERT INTO articles (title, url, description, source, category, region, image, published_at, author, city, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [$testTitle, "https://traveltew.com/featured-london", $testDesc, "TTN News", "Major Cities", "Europe", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad", date('Y-m-d H:i:s'), "TTN Author", "London", 0]
                );
                echo json_encode(['status' => 'success', 'message' => 'Major Cities test record seeded successfully!']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Table mismatch: ' . $e->getMessage()]);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
