<?php
$url = "http://prod-app.earthchem.org:8989/geoserver/SESAR/wms?";
echo file_get_contents($url.http_build_query($_GET));
