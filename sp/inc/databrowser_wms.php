<?php
$root = $_SERVER['DOCUMENT_ROOT']; 
if ($_GET['REQUEST']&&$_GET['REQUEST']=='GetFeatureInfo') {
	$data = array(
		"REQUEST" => "GetFeatureInfo",
		"SERVICE" => "WMS",
		"VERSION" => "1.1.1",
		"WIDTH" => 4,
		"HEIGHT" => 4,
		"X" => 2,
		"Y" => 2,
		"LAYERS" => "TracksAll",
		"QUERY_LAYERS" => "TracksAll",
		"INFO_FORMAT" => "text/html",
		"FEATURE_COUNT" => 1,
		"SRS" => "EPSG:4326",
	);
	if ($_GET['INFO_FORMAT']&&preg_match("/^text\/(plain|html)$/",$_GET['INFO_FORMAT'])) {
		$data['INFO_FORMAT'] = $_GET['INFO_FORMAT'];
	}
} else {
	$data = array(
		"REQUEST" => "GetMap",
		"SERVICE" => "WMS",
		"VERSION" => "1.1.1",
		"BGCOLOR" => "0xFFFFFF",
		"TRANSPARENT" => "TRUE",
		"WIDTH" => 256,
		"HEIGHT" => 256,
		"reaspect" => "false",
		"LAYERS" => "TracksAll",
		"FORMAT" => "image/png",
		"SRS" => "EPSG:3395",
		"BBOX" => "-20037508.342789244,9985163.163185008,-10018754.171394622,19904906.94082544"
	);
	if ($_GET['FORMAT']&&preg_match("/^image\/(gif|png)$/",$_GET['FORMAT']))
		$data['FORMAT'] = $_GET['FORMAT'];
}
if ($_GET['SRS'] && preg_match("/^EPSG:[0-9]+$/",$_GET['SRS']))
	$data['SRS'] = $_GET['SRS'];
if ($_GET['BBOX'])
	$data['BBOX'] = $_GET['BBOX'];
if (!$data['INFO_FORMAT']) {
	header("Content-Type: {$data['FORMAT']}");
	$md5 = md5(print_r($data,true));
	$file = "/public/mgg/web/www.marine-geo.org/inc/tilecache/databrowser_$md5.png";
	$stat = @stat($file);
	if (!$stat || (time()-$stat['mtime']) > 604800 ) {
		$image_data = file_get_contents("http://www.marine-geo.org/services/mapserver/wmscontrolpoints?".http_build_query($data));
		$fh = fopen($file, 'w');
		fwrite($fh, $image_data);
		fclose($fh);
	} else {
		$image_data = file_get_contents($file);
	}
	echo $image_data;
} else {
	header("Content-Type: {$data['INFO_FORMAT']}");
	$url = "http://www.marine-geo.org/services/mapserver/wmscontrolpoints?";
	echo file_get_contents($url.http_build_query($data));
}