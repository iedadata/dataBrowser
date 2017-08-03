<?php
$url = "app.geosamples.org/samples/polygon/" . urlencode(trim($_GET['polygon'],'\n')) . '?';
unset($_GET['polygon']);

$url = $url . http_build_query($_GET);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
//echo $url;
//exit();
echo curl_exec($ch);
//echo readfile($url.http_build_query($_GET));
