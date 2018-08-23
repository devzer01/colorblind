<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Google\Cloud\Speech\SpeechClient;



$app->get("/dashboard", function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response->withAddedHeader('Access-Control-Allow-Origin', '*'), 'dashboard.phtml', ['map' => '']);
});

$app->get("/concept", function (Request $request, Response $response, array $args) {

    $key = "AIzaSyB9vGT8ZLx2xlJ_pcZmXqRoO2lGcGd25DU";
    $cxv = "%20007681948213644044031:tswqn5l0jju";
    $json = file_get_contents("https://www.googleapis.com/customsearch/v1?tbs=itp:clipart&safe=off&source=lnms&tbm=isch&sa=X&searchtype=image&key=$key&cx=$cxv&q=" . $request->getParam('w'));
    return $response->withJson(array_map(function ($v) {
	return $v->pagemap->imageobject[0]->url;
    }, json_decode($json)->items));
});


$app->post("/audio", function (Request $request, Response $response, array $args) {
    $blob = $request->getUploadedFiles();

    # Instantiates a client
    $speech = new SpeechClient([
        'projectId' => 'cogneticio',
        'languageCode' => 'th-TH',
    ]);


    # The audio file's encoding and sample rate
    $options = [
        'encoding' => 'LINEAR16',
        'sampleRateHertz' => 16000,
    ];

    # Detects speech in the audio file
    $results = $speech->recognize($blob['data']->getStream());

    $txt = [];
    foreach ($results as $result) {
        $txt[] = $result->alternatives()[0]['transcript'];
    }
    return $response->withJson($txt);
});

$app->get("/score/[{id}]", function (Request $request, Response $response, array $args) {
    $options = ['dbname' => 'cognetic', 'url' => 'http://pituwa:pituwa@localhost:5984'];
    $client = Doctrine\CouchDB\CouchDBClient::create($options);
    $doc = $client->findDocument($args['id']);
    $isEmpty = ($doc->headers['status'] === 404);
    return $response->withJson(['empty' => $isEmpty, 'id' => $args['id'], 'doc' => !$isEmpty ? $doc->body : [] ]);
});

$app->post("/score", function (Request $request, Response $response, array $args) {
    $options = ['dbname' => 'cognetic', 'url' => 'http://pituwa:pituwa@localhost:5984'];
    $client = Doctrine\CouchDB\CouchDBClient::create($options);
    $response->withJson($client->postDocument($request->getParsedBody()));
});

$app->get("/colors", function (Request $request, Response $response, array $args) {
    $colors = [
        'en' => ["black", "red", "blue", "yellow"],
        'th' => ["ดำ", "แดง", "ฟ้า", "เหลือง" ],
        'si' => ["කළු", "රතු", "නිල්", "කහ"],
        'tm' => ["கருப்பு", "சிவப்பு", "நீலம்", "மஞ்சள்"],
        'bg' => ["কালো", "লাল", "নীল", "হলুদ"]
    ];
    return $response->withJson(['colors' => $colors]);
});

// Routes
$app->get("/talk", function (Request $request, Response $response, array $args) {

    return $this->renderer->render($response, 'dashboard.phtml', []);
});

// Routes
$app->get("/", function (Request $request, Response $response, array $args) {
    $colors = [
        'en' => ["black", "red", "blue", "yellow"],
        'th' => ["ฟ้า", "เหลือง", "แดง", "ดำ"],
        'si' => ["කළු", "රතු", "නිල්", "කහ"],
        'tm' => ["கருப்பு", "சிவப்பு", "நீலம்", "மஞ்சள்"],
        'bg' => ["কালো", "লাল", "নীল", "হলুদ"]
    ];
    $lang = $request->getQueryParam("lang", "en");
    $color = $colors[$lang];
    $headers = [
        ['Access-Control-Expose-Headers', '*'],
        ['Access-Control-Allow-Origin', '*'],
        ['Access-Control-Allow-Credentials', 'true'],
        ['Access-Control-Allow-Headers', '*']
    ];

    foreach ($headers as $header) {
        list($key, $val) = $header;
        $response = $response->withAddedHeader($key, $val);
    }

    return $this->renderer->render($response, 'index.phtml', ['map' => json_encode($color)]);
});
