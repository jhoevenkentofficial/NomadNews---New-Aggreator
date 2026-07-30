<?php
// Prevent timeouts on slow shared hosting
set_time_limit(0); 
ignore_user_abort(true);
require_once 'db.php';

$regionKeywords = [
    'Asia' => ['Thailand', 'Singapore', 'Japan', 'China', 'Vietnam', 'Bali', 'India', 'Seoul', 'Tokyo', 'Bangkok', 'Asia', 'Phuket', 'Chiang Mai', 'Manila', 'Cebu', 'Phnom+Penh', 'Siem+Reap', 'Yangon', 'Colombo', 'Male', 'Kathmandu', 'Pakistan', 'Bangladesh', 'Nepal', 'Bhutan', 'Maldives', 'Myanmar', 'Laos', 'Brunei', 'Cambodia', 'South+Korea', 'North+Korea', 'Taiwan', 'Hong+Kong', 'Macao'],
    'Europe' => ['UK', 'London', 'Paris', 'France', 'Italy', 'Rome', 'Spain', 'Madrid', 'Germany', 'Berlin', 'Europe', 'Greece', 'Barcelona', 'Amsterdam', 'Vienna', 'Prague', 'Budapest', 'Lisbon', 'Athens', 'Milan', 'Florence', 'Venice', 'Munich', 'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh', 'Brussels', 'Zurich', 'Geneva', 'Oslo', 'Helsinki', 'Reykjavik', 'Moscow', 'St. Petersburg', 'Warsaw', 'Krakow', 'Tallinn', 'Riga', 'Ireland', 'Dublin', 'France', 'Spain', 'Italy', 'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Portugal', 'Greece', 'Cyprus', 'Malta', 'Poland', 'Czech', 'Hungary', 'Romania', 'Ukraine', 'Russia'],
    'North America' => ['USA', 'Canada', 'Mexico', 'New York', 'California', 'Florida', 'Toronto', 'Vancouver', 'North America', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Orlando', 'Chicago', 'Montreal', 'Mexico City', 'Cancun', 'Havana', 'San Jose', 'Panama City', 'Jamaica', 'Trinidad', 'Barbados', 'Bahamas', 'Belize', 'Dominican+Republic'],
    'South America' => ['Brazil', 'Argentina', 'Chile', 'Peru', 'Amazon', 'Colombia', 'South America', 'Lima', 'Cusco', 'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Santiago', 'Bogota', 'Cartagena', 'Ecuador', 'Uruguay', 'Panama'],
    'Africa' => ['South Africa', 'Egypt', 'Kenya', 'Morocco', 'Nigeria', 'Safari', 'Africa', 'Cape Town', 'Johannesburg', 'Marrakech', 'Cairo', 'Luxor', 'Nairobi', 'Zanzibar', 'Addis Ababa', 'Ghana', 'Uganda', 'Tanzania', 'Ethiopia', 'Rwanda', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Mauritius'],
    'Middle East' => ['Dubai', 'UAE', 'Israel', 'Qatar', 'Saudi Arabia', 'Middle East', 'Jordan', 'Kuwait', 'Bahrain', 'Abu Dhabi', 'Tel Aviv', 'Jerusalem', 'Doha', 'Mecca', 'Bahrain', 'Oman', 'Lebanon', 'Palestine', 'Iraq', 'Iran'],
    'Oceania' => ['Australia', 'Sydney', 'New Zealand', 'Auckland', 'Fiji', 'Oceania', 'Melbourne', 'Brisbane', 'Queenstown', 'Papua+New+Guinea', 'Samoa']
];

$majorCities = [
    'Paris', 'London', 'Bangkok', 'Dubai', 'Singapore', 'New York City', 'Istanbul', 'Tokyo', 'Kuala Lumpur', 'Hong Kong',
    'Rome', 'Barcelona', 'Amsterdam', 'Madrid', 'Berlin', 'Vienna', 'Prague', 'Budapest', 'Lisbon', 'Athens', 'Milan',
    'Florence', 'Venice', 'Munich', 'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh', 'Brussels', 'Zurich', 'Geneva',
    'Oslo', 'Helsinki', 'Reykjavik', 'Moscow', 'St. Petersburg', 'Warsaw', 'Krakow', 'Tallinn', 'Riga', 'Beijing',
    'Shanghai', 'Seoul', 'Osaka', 'Kyoto', 'Taipei', 'Hanoi', 'Ho Chi Minh City', 'Bali (Denpasar)', 'Jakarta', 'Phuket',
    'Chiang Mai', 'Manila', 'Cebu', 'Phnom Penh', 'Siem Reap', 'Yangon', 'Colombo', 'Male', 'Kathmandu', 'Sydney',
    'Melbourne', 'Brisbane', 'Auckland', 'Queenstown', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Orlando',
    'Chicago', 'Toronto', 'Vancouver', 'Montreal', 'Mexico City', 'Cancun', 'Havana', 'San Jose (Costa Rica)', 'Panama City', 'Lima',
    'Cusco', 'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Santiago', 'Bogota', 'Cartagena', 'Cape Town', 'Johannesburg',
    'Marrakech', 'Cairo', 'Luxor', 'Nairobi', 'Zanzibar City', 'Addis Ababa', 'Tel Aviv', 'Jerusalem', 'Doha', 'Abu Dhabi', 'Mecca'
];

function detectRegion($text, $title, $description) {
    global $regionKeywords;
    $content = strtolower($text . ' ' . $title . ' ' . $description);
    foreach ($regionKeywords as $region => $keywords) {
        foreach ($keywords as $kw) {
            if (strpos($content, strtolower($kw)) !== false) return $region;
        }
    }
    return 'Global';
}

function detectCity($title, $description) {
    global $majorCities;
    $content = strtolower($title . ' ' . $description);
    foreach ($majorCities as $city) {
        if (strpos($content, strtolower($city)) !== false) return $city;
    }
    return null;
}

function detectCategory($title, $description, $currentCat) {
    $content = strtolower($title . ' ' . $description);
    
    // Breaking News Detection
    if (preg_match('/(explosion|breaking|urgent|attack|war|missile|targeted|bomb|fighting|emergency)/i', $content)) {
        return 'Breaking News';
    }
    
    // Airport News Detection
    if (preg_match('/(airport|terminal|gate|aviation|flight delay|runway|air traffic control|atc|airline|fuselage)/i', $content)) {
        return 'Airport News';
    }

    // Popular Destinations Keywords
    $popularDestinations = ['Thailand', 'Bali', 'Vietnam', 'Cambodia', 'Laos', 'France', 'Italy', 'Spain', 'Greece', 'USA', 'Australia', 'Mexico', 'Colombia', 'Peru', 'Dubai', 'India', 'UK', 'El Salvador', 'Nicaragua', 'Cuba', 'Ukraine'];
    foreach ($popularDestinations as $dest) {
        if (stripos($content, $dest) !== false) return 'Popular Destinations';
    }

    // Major Cities check
    global $majorCities;
    foreach ($majorCities as $city) {
        if (stripos($content, $city) !== false) return 'Major Cities';
    }
    
    return $currentCat;
}

function extractSource($feedUrl) {
    // Extract a clean outlet name from the feed URL
    $host = parse_url($feedUrl, PHP_URL_HOST) ?? '';
    $host = preg_replace('/^www\./', '', $host);
    // Map known hosts to proper brand names
    $knownSources = [
        'skift.com'             => 'Skift',
        'cntraveler.com'        => 'Condé Nast Traveler',
        'travelweekly.co.uk'    => 'Travel Weekly',
        'travelnewsasia.com'    => 'Travel News Asia',
        'ttgasia.com'           => 'TTG Asia',
        'travelpulse.com'       => 'TravelPulse',
        'tourismupdate.co.za'   => 'Tourism Update',
        'hoteliermiddleeast.com'=> 'Hotelier Middle East',
        'simpleflying.com'      => 'Simple Flying',
        'bbci.co.uk'            => 'BBC News',
        'bbc.co.uk'             => 'BBC News',
        'cnn.com'               => 'CNN',
        'rss.cnn.com'           => 'CNN',
        'aljazeera.com'         => 'Al Jazeera',
        'reutersagency.com'     => 'Reuters',
        'aviationpros.com'      => 'Aviation Pros',
        'traveldailynews.com'   => 'Travel Daily News',
        'nytimes.com'           => 'The New York Times',
        'theguardian.com'       => 'The Guardian',
        'arabnews.com'          => 'Arab News',
        'straitstimes.com'      => 'The Straits Times',
        'smh.com.au'            => 'Sydney Morning Herald',
        'dawn.com'              => 'Dawn',
        'thestar.com.my'        => 'The Star',
        'theglobeandmail.com'   => 'The Globe and Mail',
    ];
    if (isset($knownSources[$host])) return $knownSources[$host];
    // Fallback: capitalize the domain
    $parts = explode('.', $host);
    return ucfirst($parts[0] ?? 'News Wire');
}

/**
 * Attempt to scrape the full article content from a URL
 */
function scrapeFullContent($url) {
    if (!$url) return '';
    
    $context = stream_context_create([
        "http" => [
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n",
            "timeout" => 15,
            "follow_location" => 1
        ]
    ]);
    
    $html = @file_get_contents($url, false, $context);
    if (!$html) return '';

    // Handle encoding issues
    $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');

    $doc = new DOMDocument();
    // Use flags to handle malformed HTML gracefully
    @$doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $xpath = new DOMXPath($doc);

    // Common article selectors (ordered by specificity and commonality)
    $selectors = [
        "//article",
        "//main",
        "//div[contains(@class, 'article-content')]",
        "//div[contains(@class, 'article-body')]",
        "//div[contains(@class, 'post-content')]",
        "//div[contains(@class, 'entry-content')]",
        "//div[contains(@class, 'story-body')]",
        "//div[contains(@class, 'content-inner')]",
        "//div[contains(@id, 'article-body')]",
        "//div[contains(@id, 'story-body')]",
        "//div[contains(@class, 'td-post-content')]", // Common in WP Newspaper themes
        "//section[contains(@class, 'article')]",
        "//div[contains(@class, 'article-text')]"
    ];

    $content = "";
    foreach ($selectors as $selector) {
        $nodes = $xpath->query($selector);
        if ($nodes->length > 0) {
            foreach ($nodes as $node) {
                // Remove known noisy elements inside the content
                $noiseSelectors = [
                    ".//script", ".//style", ".//nav", ".//footer", ".//header", 
                    ".//aside", ".//iframe", ".//form", ".//button", 
                    ".//div[contains(@class, 'ad')]", ".//div[contains(@class, 'social')]",
                    ".//div[contains(@class, 'share')]", ".//div[contains(@class, 'related')]",
                    ".//div[contains(@class, 'newsletter')]", ".//div[contains(@class, 'promo')]",
                    ".//div[contains(@class, 'tags')]", ".//div[contains(@class, 'comments')]"
                ];
                foreach ($noiseSelectors as $ns) {
                    $noises = $xpath->query($ns, $node);
                    foreach ($noises as $noise) {
                        if ($noise->parentNode) $noise->parentNode->removeChild($noise);
                    }
                }
                
                $nodeHtml = $doc->saveHTML($node);
                // Strip tags from a copy to check actual text length
                if (strlen(strip_tags($nodeHtml)) > 200) {
                    $content .= $nodeHtml;
                }
            }
            if (strlen(strip_tags($content)) > 400) break; // Found enough content
        }
    }

    // Fallback: If no major container found, try to extract all relevant P tags
    if (strlen(strip_tags($content)) < 250) {
        $content = "";
        $nodes = $xpath->query("//p");
        $paraCount = 0;
        foreach ($nodes as $node) {
            $text = trim($node->nodeValue);
            // Ignore short fragments, navigation links, and copyright notices
            if (strlen($text) > 60 && !preg_match('/(click here|follow us|copyright|all rights reserved|read more|privacy policy)/i', $text)) {
                $content .= "<p>" . htmlspecialchars($text) . "</p>";
                $paraCount++;
            }
        }
    }

    // Final Clean up
    $content = preg_replace('/<script\b[^>]*>[\s\S]*?<\/script>/i', '', $content);
    $content = preg_replace('/<style\b[^>]*>[\s\S]*?<\/style>/i', '', $content);
    $content = preg_replace('/on\w+="[^"]*"/i', '', $content);
    $content = preg_replace('/<a\b[^>]*>(.*?)<\/a>/i', '$1', $content); // Strip links to keep users on YOUR site
    
    // Ensure we don't have empty tags
    $content = preg_replace('/<[^>]*>\s*<\/[^>]*>/', '', $content);
    $content = preg_replace('/<div\b[^>]*>\s*<\/div>/i', '', $content);
    $content = preg_replace('/<p\b[^>]*>\s*<\/p>/i', '', $content);
    
    // Fix common character encoding artifacts
    $content = str_replace(['Â', 'â'], '', $content);

    return trim($content);
}

function fetchAllNews() {
    $feeds = [
        ['url' => 'https://skift.com/feed/', 'category' => 'Travel News', 'region' => 'Global'],
        ['url' => 'https://www.cntraveler.com/feed/rss', 'category' => 'Popular Destinations', 'region' => 'Global'],
        ['url' => 'https://www.travelweekly.co.uk/rss/news', 'category' => 'Travel News', 'region' => 'Europe'],
        ['url' => 'https://www.travelnewsasia.com/travelnews.xml', 'category' => 'Travel News', 'region' => 'Asia'],
        ['url' => 'https://ttgasia.com/feed/', 'category' => 'Travel News', 'region' => 'Asia'],
        ['url' => 'https://www.travelpulse.com/rss/news.rss', 'category' => 'Travel News', 'region' => 'North America'],
        ['url' => 'https://www.tourismupdate.co.za/rss.xml', 'category' => 'Travel News', 'region' => 'Africa'],
        ['url' => 'https://www.hoteliermiddleeast.com/feed', 'category' => 'Hotels', 'region' => 'Middle East'],
        ['url' => 'https://simpleflying.com/feed/', 'category' => 'Airport News', 'region' => 'Global'],
        ['url' => 'http://feeds.bbci.co.uk/news/world/rss.xml', 'category' => 'Breaking News', 'region' => 'Europe'],
        ['url' => 'http://rss.cnn.com/rss/cnn_topstories.rss', 'category' => 'Breaking News', 'region' => 'North America'],
        ['url' => 'https://www.aljazeera.com/xml/rss/all.xml', 'category' => 'Breaking News', 'region' => 'Middle East'],
        ['url' => 'https://www.reutersagency.com/feed/', 'category' => 'Breaking News', 'region' => 'Global'],
        ['url' => 'https://www.aviationpros.com/rss/news', 'category' => 'Airport News', 'region' => 'North America'],
        ['url' => 'https://www.traveldailynews.com/feed/', 'category' => 'Travel News', 'region' => 'Global'],
        ['url' => 'https://rss.nytimes.com/services/xml/rss/nyt/Travel.xml', 'category' => 'Travel News', 'region' => 'North America'],
        ['url' => 'https://www.theguardian.com/uk/travel/rss', 'category' => 'Travel News', 'region' => 'Europe'],
        ['url' => 'https://www.arabnews.com/cat/3/rss.xml', 'category' => 'Travel News', 'region' => 'Middle East'],
        ['url' => 'https://www.straitstimes.com/news/asia/rss.xml', 'category' => 'Travel News', 'region' => 'Asia'],
        ['url' => 'https://www.smh.com.au/rss/travel.xml', 'category' => 'Travel News', 'region' => 'Oceania'],
        ['url' => 'https://www.dawn.com/feeds/news/', 'category' => 'Travel News', 'region' => 'Asia'],
        ['url' => 'https://www.thestar.com.my/rss/lifestyle/travel', 'category' => 'Travel News', 'region' => 'Asia'],
        ['url' => 'https://www.theglobeandmail.com/life/travel/?service=rss', 'category' => 'Travel News', 'region' => 'North America']
    ];

    $totalSaved = 0;
    foreach ($feeds as $feed) {
        try {
            $context = stream_context_create(["http" => ["header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n"]]);
            $content = @file_get_contents($feed['url'], false, $context);
            if (!$content) continue;
            $rss = @simplexml_load_string($content);
            if (!$rss) continue;
            
            $items = $rss->channel->item ?? $rss->entry;
            foreach ($items as $item) {
                $title = (string)$item->title;
                $link = (string)($item->link ?: $item->link['href']);
                $desc = strip_tags((string)($item->description ?: $item->summary));
                $author = (string)($item->creator ?? $item->author ?? $item->children('dc', true)->creator ?? 'Staff Reporter');
                $source = extractSource($feed['url']);

                // Try to get full article body from content:encoded (many feeds provide it)
                $contentEncoded = (string)($item->children('content', true)->encoded ?? '');
                if (!$contentEncoded) {
                    // Fallback: some feeds put it in media:content or description as HTML
                    $contentEncoded = (string)($item->children('media', true)->description ?? '');
                }

                // If still empty or very short, attempt to scrape the full article from the link
                if (strlen($contentEncoded) < 200) {
                    $scraped = scrapeFullContent($link);
                    if ($scraped) $contentEncoded = $scraped;
                }

                // NEW: Extract 2-3 paragraphs for the description from the content
                if (strlen($contentEncoded) > 300) {
                    $doc = new DOMDocument();
                    @$doc->loadHTML('<?xml encoding="utf-8" ?>' . $contentEncoded, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
                    $xpath = new DOMXPath($doc);
                    $pNodes = $xpath->query("//p");
                    $paragraphs = [];
                    foreach ($pNodes as $p) {
                        $pText = trim($p->nodeValue);
                        if (strlen($pText) > 60) {
                            $paragraphs[] = $pText;
                            if (count($paragraphs) >= 3) break;
                        }
                    }
                    if (count($paragraphs) > 0) {
                        $desc = implode("\n\n", $paragraphs);
                    }
                }

                // Clean up any script/style tags but keep paragraphs and formatting
                if ($contentEncoded) {
                    $contentEncoded = preg_replace('/<script\b[^>]*>[\s\S]*?<\/script>/i', '', $contentEncoded);
                    $contentEncoded = preg_replace('/<style\b[^>]*>[\s\S]*?<\/style>/i', '', $contentEncoded);
                    $contentEncoded = preg_replace('/on\w+="[^"]*"/i', '', $contentEncoded);
                }
                
                $city = detectCity($title, $desc);
                $category = detectCategory($title, $desc, $feed['category']);
                $region = ($feed['region'] !== 'Global') ? $feed['region'] : detectRegion($feed['url'], $title, $desc);
                $pubDate = date('Y-m-d H:i:s', strtotime((string)$item->pubDate ?: $item->updated ?: $item->published));
                $isBreaking = ($category === 'Breaking News') ? 1 : 0;
                
                try {
                    turso_query(
                        "INSERT OR IGNORE INTO articles (title, url, description, content, source, category, region, image, published_at, author, city, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [$title, $link, $desc, $contentEncoded, $source, $category, $region, "https://picsum.photos/seed/".urlencode($title)."/800/400", $pubDate, $author, $city, $isBreaking]
                    );
                    $totalSaved++;
                } catch (Exception $e) { }
            }
        } catch (Exception $e) { }
    }

    // GNews API - High Volume Specialized Queries
    $gnewsQueries = [
        ['q' => 'breaking news travel alerts world', 'cat' => 'Breaking News'],
        ['q' => 'airport news flight delays aviation', 'cat' => 'Airport News'],
        ['q' => 'travel news tourism industry', 'cat' => 'Travel News'],
        ['q' => 'Paris London Rome tourism travel', 'cat' => 'Major Cities'],
        ['q' => 'Bali Thailand Japan travel destinations', 'cat' => 'Popular Destinations'],
        ['q' => 'USA travel news airlines', 'cat' => 'North America'],
        ['q' => 'Europe travel news tourism', 'cat' => 'Europe'],
        ['q' => 'Middle East travel Dubai Qatar Saudi', 'cat' => 'Middle East'],
        ['q' => 'Asia travel Japan Singapore Thailand China', 'cat' => 'Asia'],
        ['q' => 'Africa travel Safari Egypt South Africa', 'cat' => 'Africa'],
        ['q' => 'South America travel Brazil Argentina Peru', 'cat' => 'South America'],
        ['q' => 'Oceania travel Australia New Zealand Fiji', 'cat' => 'Oceania'],
        ['q' => 'business travel hotel management', 'cat' => 'Travel News'],
        ['q' => 'luxury travel cruising resorts', 'cat' => 'Popular Destinations'],
        ['q' => 'budget travel backpacking Europe', 'cat' => 'Popular Destinations'],
        ['q' => 'TSA airport security flight safety', 'cat' => 'Airport News']
    ];

    foreach ($gnewsQueries as $gn) {
        $url = "https://gnews.io/api/v4/search?q=" . urlencode($gn['q']) . "&token=" . NEWS_API_KEY . "&lang=en&max=10";
        $response = @file_get_contents($url);
        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['articles'])) {
                foreach ($data['articles'] as $article) {
                    try {
                        $city = detectCity($article['title'], $article['description']);
                        $category = $city ? 'Major Cities' : detectCategory($article['title'], $article['description'], $gn['cat']);
                        $isBreaking = ($category === 'Breaking News') ? 1 : 0;
                        $author = !empty($article['source']['name']) ? $article['source']['name'] : 'Staff Reporter';
                        $source = !empty($article['source']['name']) ? $article['source']['name'] : 'News Wire';
                        // GNews API provides full content in article['content'] field
                        $gnContent = !empty($article['content']) ? $article['content'] : '';

                        // NEW: Extract 2-3 paragraphs for GNews too
                        if (!empty($gnContent)) {
                            $gnDesc = $article['description'];
                            $doc = new DOMDocument();
                            @$doc->loadHTML('<?xml encoding="utf-8" ?>' . $gnContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
                            $xpath = new DOMXPath($doc);
                            $pNodes = $xpath->query("//p");
                            $paragraphs = [];
                            foreach ($pNodes as $p) {
                                $pText = trim($p->nodeValue);
                                if (strlen($pText) > 60) {
                                    $paragraphs[] = $pText;
                                    if (count($paragraphs) >= 3) break;
                                }
                            }
                            if (count($paragraphs) > 0) {
                                $gnDesc = implode("\n\n", $paragraphs);
                            }
                            $article['description'] = $gnDesc;
                        }

                        turso_query(
                            "INSERT OR IGNORE INTO articles (title, url, description, content, source, category, region, image, published_at, author, city, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            [$article['title'], $article['url'], $article['description'], $gnContent, $source, $category, detectRegion('', $article['title'], $article['description']), $article['image'], date('Y-m-d H:i:s', strtotime($article['publishedAt'])), $author, $city, $isBreaking]
                        );
                        $totalSaved++;
                    } catch (Exception $e) { }
                }
            }
        }
    }

    return $totalSaved;
}

if (php_sapi_name() === 'cli' || isset($_GET['run'])) {
    echo "Starting global fetch...\n";
    $count = fetchAllNews();
    echo "Fetch completed. Saved $count total high-volume articles.\n";
}
?>

