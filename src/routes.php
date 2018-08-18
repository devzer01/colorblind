<?php

use Slim\Http\Request;
use Slim\Http\Response;

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

    return $this->renderer->render($response, 'index.phtml', ['map' => json_encode($color)]);
});
