<?php
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');

$route = isset($_GET['route']) ? trim($_GET['route']) : 'latest';
$page = max(1, isset($_GET['page']) ? (int)$_GET['page'] : 1);
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 18;
$limit = max(1, min(100, $limit));
$offset = ($page - 1) * $limit;

$listColumns = "id, title, url, description, source, category, region, image, published_at, trending, author, city, is_breaking";

function pagination_payload($total, $page, $limit) {
    return [
        'currentPage' => $page,
        'totalPages' => max(1, (int)ceil($total / $limit)),
        'totalArticles' => $total
    ];
}

function send_articles($sql, $args, $countSql, $countArgs, $page, $limit) {
    $res = turso_query($sql, $args);
    $countRes = turso_query($countSql, $countArgs);
    $total = (int)(clean_rows($countRes)[0]['count'] ?? 0);

    echo json_encode([
        'articles' => clean_rows($res),
        'pagination' => pagination_payload($total, $page, $limit)
    ]);
}

function pattern($value) {
    return '%' . strtolower(trim((string)$value)) . '%';
}

function slug_pattern($value) {
    return '%' . strtolower(str_replace('-', '%', trim((string)$value))) . '%';
}

try {
    switch ($route) {
        case 'health':
            $total = clean_rows(turso_query("SELECT COUNT(*) as count FROM articles"))[0]['count'] ?? 0;
            echo json_encode([
                'status' => 'ok',
                'db' => 'turso',
                'server' => 'php',
                'totalArticles' => (int)$total,
                'time' => date('c')
            ]);
            break;

        case 'fetch':
            ob_start();
            require_once 'fetch.php';
            $output = ob_get_clean();
            echo json_encode(['status' => 'success', 'message' => 'News fetch triggered', 'details' => $output]);
            break;

        case 'migrate':
            try {
                turso_query("ALTER TABLE articles ADD COLUMN content TEXT DEFAULT ''");
                echo json_encode(['status' => 'success', 'message' => 'Migration complete: content column added']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'ok', 'message' => 'Migration not needed: ' . $e->getMessage()]);
            }
            break;

        case 'repair':
            require_once 'fetch.php';
            $repairLimit = max(1, min(200, isset($_GET['limit']) ? (int)$_GET['limit'] : 50));
            $res = turso_query("SELECT id, url, title FROM articles WHERE (content IS NULL OR content = '' OR length(content) < 200) AND url LIKE 'http%' ORDER BY published_at DESC LIMIT ?", [$repairLimit]);
            $rows = clean_rows($res);
            $repaired = 0;

            foreach ($rows as $row) {
                $fullContent = scrapeFullContent($row['url']);
                if ($fullContent && strlen(strip_tags($fullContent)) > 200) {
                    turso_query("UPDATE articles SET content = ? WHERE id = ?", [$fullContent, (int)$row['id']]);
                    $repaired++;
                }
            }
            echo json_encode(['status' => 'success', 'message' => "Repair complete. Attempted $repairLimit articles, filled $repaired articles."]);
            break;

        case 'latest':
            send_articles(
                "SELECT $listColumns FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?",
                [$limit, $offset],
                "SELECT COUNT(*) as count FROM articles",
                [],
                $page,
                $limit
            );
            break;

        case 'category':
            $keyword = slug_pattern($_GET['category'] ?? '');
            send_articles(
                "SELECT $listColumns FROM articles WHERE LOWER(category) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?",
                [$keyword, $limit, $offset],
                "SELECT COUNT(*) as count FROM articles WHERE LOWER(category) LIKE ?",
                [$keyword],
                $page,
                $limit
            );
            break;

        case 'region':
            $keyword = pattern($_GET['region'] ?? '');
            send_articles(
                "SELECT $listColumns FROM articles WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?",
                [$keyword, $keyword, $keyword, $limit, $offset],
                "SELECT COUNT(*) as count FROM articles WHERE LOWER(region) LIKE ? OR LOWER(description) LIKE ? OR LOWER(title) LIKE ?",
                [$keyword, $keyword, $keyword],
                $page,
                $limit
            );
            break;

        case 'trending':
            $sql = "SELECT $listColumns FROM articles WHERE trending = 1 ORDER BY published_at DESC LIMIT 10";
            $rows = clean_rows(turso_query($sql));
            if (empty($rows)) {
                $rows = clean_rows(turso_query("SELECT $listColumns FROM articles ORDER BY published_at DESC LIMIT 10"));
            }
            echo json_encode(['articles' => $rows]);
            break;

        case 'sources':
            $rows = clean_rows(turso_query("SELECT DISTINCT source, COALESCE(region, 'Global') as region FROM articles WHERE source IS NOT NULL AND source != '' ORDER BY region, source"));
            $grouped = [];
            foreach ($rows as $row) {
                $region = $row['region'] ?: 'Global';
                if (!isset($grouped[$region])) $grouped[$region] = [];
                if (!in_array($row['source'], $grouped[$region], true)) $grouped[$region][] = $row['source'];
            }
            echo json_encode($grouped);
            break;

        case 'source':
            $keyword = pattern($_GET['source'] ?? '');
            send_articles(
                "SELECT $listColumns FROM articles WHERE LOWER(source) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?",
                [$keyword, $limit, $offset],
                "SELECT COUNT(*) as count FROM articles WHERE LOWER(source) LIKE ?",
                [$keyword],
                $page,
                $limit
            );
            break;

        case 'search':
            $query = trim($_GET['q'] ?? '');
            if ($query === '') {
                echo json_encode(['articles' => [], 'pagination' => pagination_payload(0, $page, $limit)]);
                break;
            }
            $keyword = pattern($query);
            send_articles(
                "SELECT $listColumns FROM articles WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ? OR LOWER(city) LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?",
                [$keyword, $keyword, $keyword, $keyword, $limit, $offset],
                "SELECT COUNT(*) as count FROM articles WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ? OR LOWER(city) LIKE ?",
                [$keyword, $keyword, $keyword, $keyword],
                $page,
                $limit
            );
            break;

        case 'article':
            $id = trim($_GET['id'] ?? '');
            if ($id === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Article ID is required']);
                break;
            }
            $rows = clean_rows(turso_query("SELECT * FROM articles WHERE id = ? OR url = ? LIMIT 1", [$id, $id]));
            if (empty($rows)) {
                http_response_code(404);
                echo json_encode(['error' => 'Article not found', 'id' => $id]);
            } else {
                echo json_encode($rows[0]);
            }
            break;

        case 'diag':
            $total = clean_rows(turso_query("SELECT COUNT(*) as count FROM articles"))[0]['count'] ?? 0;
            $cats = clean_rows(turso_query("SELECT category, COUNT(*) as count FROM articles GROUP BY category"));
            $regions = clean_rows(turso_query("SELECT region, COUNT(*) as count FROM articles GROUP BY region"));
            $recent = clean_rows(turso_query("SELECT title, source, category, region, published_at FROM articles ORDER BY published_at DESC LIMIT 10"));
            echo json_encode([
                'status' => 'success',
                'timestamp' => date('c'),
                'total_articles' => (int)$total,
                'category_distribution' => $cats,
                'region_distribution' => $regions,
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

            $secret = trim($body['secret'] ?? '');
            if ($secret !== 'TRAVELTEW_2026') {
                http_response_code(403);
                echo json_encode(['error' => 'Invalid admin secret']);
                break;
            }

            $title = trim($body['title'] ?? '');
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                break;
            }

            $url = trim($body['url'] ?? '');
            $description = trim($body['description'] ?? '');
            $category = trim($body['category'] ?? 'Breaking News');
            $image = trim($body['image'] ?? '');
            $source = trim($body['source'] ?? 'TTN News');
            $author = trim($body['author'] ?? 'TTN Staff Reporter');
            $city = trim($body['city'] ?? '');
            $content = trim($body['content'] ?? $description);
            $region = trim($body['region'] ?? 'Global');
            $isBreaking = ($category === 'Breaking News' || !empty($body['isBreaking'])) ? 1 : 0;

            if ($url === '') $url = 'ttn-manual-' . time() . '-' . rand(1000, 9999);
            if ($image === '') $image = 'https://picsum.photos/seed/' . urlencode($title) . '/800/400';

            turso_query(
                "INSERT INTO articles (title, url, description, content, source, category, region, image, published_at, author, city, is_breaking, trending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$title, $url, $description, $content, $source, $category, $region, $image, date('c'), $author, $city, $isBreaking, 0]
            );
            echo json_encode(['message' => 'Article published successfully']);
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found', 'route' => $route]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>