<?php
if ($_GET['REQUEST']&&$_GET['REQUEST']=='GetFeatureInfo') {
	$data = array(
		"REQUEST" => "GetFeatureInfo",
		"SERVICE" => "WMS",
		"VERSION" => "1.1.1",
		"WIDTH" => 6,
		"HEIGHT" => 6,
		"X" => 3,
		"Y" => 3,
		"LAYERS" => "GeochronPoints",
		"QUERY_LAYERS" => "GeochronPoints",
		"INFO_FORMAT" => "text/plain",
		"FEATURE_COUNT" => 50,
		"SRS" => "EPSG:4326",
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
$url = "http://www.geochron.org/cgi-bin/mapserv?map=/var/www/geochronmap.map&";
$output = file($url.http_build_query($data));
foreach ($output as $line) {
    if (strstr($line,'uuid')!==false) {
        $matches = array();
        preg_match_all('/\d+/', $line, $matches);
        if ($matches[0][0])
            echo file_get_contents("http://www.geochron.org/ged/".((int) $matches[0][0]));
    }
}
//echo $url.http_build_query($data);
//print_r($_GET);
?>
