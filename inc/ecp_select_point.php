<?php
if ($_GET['REQUEST']&&$_GET['REQUEST']=='GetFeatureInfo') {
	$data = array(
		"REQUEST" => "GetFeatureInfo",
		"SERVICE" => "WMS",
		"VERSION" => "1.0.0",
		"WIDTH" => 6,
		"HEIGHT" => 6,
		"X" => 3,
		"Y" => 3,
		"LAYERS" => "ECPoints",
		"QUERY_LAYERS" => "ECPoints",
		"INFO_FORMAT" => "gml",
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
$url = "http://www.earthchemportal.org/cgi-bin/mapserv?map=/public/mgg/web/ecp.iedadata.org/ecmap.map&";
$data = new SimpleXMLElement(file_get_contents($url.http_build_query($data)));

if (isset($data->ECPoints_layer->ECPoints_feature)) {
foreach($data->ECPoints_layer->ECPoints_feature as $feature) {
	echo "<div class=\"tbox\" data-uuid=\"{$feature->uuid}\"><a class=\"turndown\">{$feature->sample_id}<img alt=\"&gt;\" src=\"/images/arrow_show.gif\" /></a>";
	//echo "<div class=\"tcontent\">".file_get_contents("http://ecp.iedadata.org/ged/{$feature->uuid}")."</div>";
	echo "<div class=\"tcontent\"></div>";
	echo "</div>";
}
}
//print_r($data->ECPoints_layer);

//echo $url.http_build_query($data);
//print_r($_GET);
?>
