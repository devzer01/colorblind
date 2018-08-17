<?php

use Slim\Http\Request;
use Slim\Http\Response;

// Routes
$app->get("/", function (Request $request, Response $response, array $args) {

    $colors = [
        'en' => ["blue", "yellow", "red", "black"],
        'th' => ["ฟ้า", "เหลือง", "แดง", "ดำ"],
        'dv' => ["நீலம்", "மஞ்சள்", "சிவப்பு", "கருப்பு"],
        'bg' => ["নীল", "হলুদ", "লাল", "কালো"],
        'hd' => ["नीला", "पीला", "लाल", "काला"],
        'id' => ["biru", "kuning", "merah", "hitam"],
        'my' => ["നീല", "മഞ്ഞ", "ചുവപ്പ്", "കറുപ്പ്"]
    ];
    $lang = $request->getQueryParam("lang", "en");
    $color = $colors[$lang];

    return $this->renderer->render($response, 'index.phtml', ['map' => json_encode($color)]);
});
