<?php

$xmlstring = file_get_contents("http://www.marine-geo.org/services/mapserv7/seismic_data?".$_SERVER['QUERY_STRING']);

$xml = simplexml_load_string($xmlstring);
$json = json_encode($xml);
$array = json_decode($json,TRUE);
//print_r($array);

$layers = array(
    "MGDS-DataSetsLines",
    "MGDS-DataSets",
    "MGDS-DataSets-Points",
    "MGDS-DataObjects-OBS",
    "MGDS-DataObjects-Points-OBS",
    "MGDS-DataStations-OBS",
    "UTIG-DataSet"
);

$udt = array(
    "shots" => 'Raw MCS Data',
    "stacks+migrations" => 'Processed MCS Data',
    "chirps" => 'Subbottom Data',
    "sb" => 'Sonobuoy Data',
    "obs" => 'OBS Data',
    "scs" => 'SCS Data'
);


foreach ($layers as $layer) {
    $layername = "{$layer}_layer";
    $featurename = "{$layer}_feature";
    //echo $layer;
    if ( isset($array[$layername]) ) {
        if (isAssoc($array[$layername][$featurename])) {
            $array[$layername][$featurename] = array($array[$layername][$featurename]);
        }
        
        if ($layer == "UTIG-DataSet") {
            foreach ($array[$layername][$featurename] as $feature) {
            echo sprintf(
                    "<div><a href=\"%s#segy_proc\" target=\"_blank\"><b style=\"font-size:1.1em\">%s</b></a></div>"
                    ."<div><b>Cruise:</b> <a href=\"%s\" target=\"_blank\">%s</a></div>"
                    ."<div><b>Contributor:</b> %s</div><hr>",
					$feature['cruise_url'],
                    $udt[$feature['data_type']],
                    $feature['cruise_url'],
                    strtoupper($feature['cruise_id']),
                    $feature['contributor']
            );
            }
        }
        else {
            foreach ($array[$layername][$featurename] as $feature) {
                if (isset($feature['data_set_url']))
                    $feature['url']=$feature['data_set_url'];
                echo sprintf(
                    "<div><b style=\"font-size:1.1em\"><a href=\"%s\" target=\"_blank\">%s Data</a></b></div>
                    <div><b>Cruise:</b> <a href=\"%s\">%s</a></div>
                    <div><b>Device Type:</b> %s</div>
                    <div><b>Chief Scientist:</b> %s</div><hr>",
                    $feature['url'], $feature['data_types'],
                    $feature['entry_url'],$feature['entry_id'],
                    $feature['device_types'],
                    $feature['chief_scientist']
                );
            }
        }
    }
}



function isAssoc(array $arr)
{
    if (array() === $arr) return false;
    return array_keys($arr) !== range(0, count($arr) - 1);
}
