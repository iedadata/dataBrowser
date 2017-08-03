<?php
if ($_GET['REQUEST']&&$_GET['REQUEST']=='GetFeatureInfo') {
    $data = array(
	"REQUEST" => "GetFeatureInfo",
	"SERVICE" => "WMS",
	"VERSION" => "1.1.0",
	"WIDTH" => 6,
	"HEIGHT" => 6,
	"X" => 3,
	"Y" => 3,
	"LAYERS" => "Astro-Geo,Earth,Glacier,Integrated,Ocean-Atmosphere,Bio",
	"QUERY_LAYERS" => "Astro-Geo,Earth,Glacier,Integrated,Ocean-Atmosphere,Bio",
	"FEATURE_COUNT" => 50,
	"SRS" => "EPSG:3031",
    );
    if ($_GET['INFO_FORMAT']&&preg_match("/^text\/(plain|html)$/",$_GET['INFO_FORMAT'])) {
	$data['INFO_FORMAT'] = $_GET['INFO_FORMAT'];
    }
}
if ($_GET['SRS'] && preg_match("/^EPSG:[0-9]+$/",$_GET['SRS']))
    $data['SRS'] = $_GET['SRS'];
if ($_GET['BBOX'])
    $data['BBOX'] = $_GET['BBOX'];
header("Content-Type: text/html");



$url = "http://api.usap-dc.org:81/wfs?";
echo file_get_contents($url.http_build_query($data));
