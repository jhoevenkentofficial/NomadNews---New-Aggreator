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

function maskSource($originalSource) {
    // Force TRAVELTEW branding for all sources
    return 'TRAVELTEW NEWS';
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
                $author = (string)($item->creator ?? $item->author ?? $item->children('dc', true)->creator ?? 'TRAVELTEW Reporter');
                $source = maskSource('');
                
                $city = detectCity($title, $desc);
                $category = detectCategory($title, $desc, $feed['category']);
                $region = ($feed['region'] !== 'Global') ? $feed['region'] : detectRegion($feed['url'], $title, $desc);
                $pubDate = date('Y-m-d H:i:s', strtotime((string)$item->pubDate ?: $item->updated ?: $item->published));
                $isBreaking = ($category === 'Breaking News') ? 1 : 0;
                
                try {
                    turso_query(
                        "INSERT INTO articles (title, url, description, source, category, region, image, published_at, author, city, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [$title, $link, $desc, $source, $category, $region, "https://picsum.photos/seed/".urlencode($title)."/800/400", $pubDate, $author, $city, $isBreaking]
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
                        $author = str_replace('By ', '', $article['source']['name']);
                        $source = maskSource('');

                        turso_query(
                            "INSERT INTO articles (title, url, description, source, category, region, image, published_at, author, city, is_breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            [$article['title'], $article['url'], $article['description'], $source, $category, detectRegion('', $article['title'], $article['description']), $article['image'], date('Y-m-d H:i:s', strtotime($article['publishedAt'])), $author, $city, $isBreaking]
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

