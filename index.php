<!DOCTYPE html>
<html>
<head>
	<title>IEDA: Data Browser</title>
	<meta name="Description" content="The IEDA Data Browser provides a quick, intuitive interface for finding and visualizing the data available through IEDA." />
    <meta charset="UTF-8">
	<link rel="stylesheet" type="text/css" href="css/mapv3.css" media="all" />
	<link rel="shortcut icon" href="http://www.iedadata.org/sites/www.iedadata.org/files/arthemia_favicon.gif" type="image/x-icon" />
	<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.10.2.custom.min.css" media="all" />
	<link rel="stylesheet" type="text/css" href="css/databrowser.css" />
	<script type="text/javascript" src="js/vendor/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.10.2.custom.min.js"></script>
    <script type="text/javascript" src="js/vendor/jquery.mCustomScrollbar.concat.min.js"></script>
   	<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyATYahozDIlFIM1mO7o66AocXi72mkPT18&sensor=false&libraries=drawing" type="text/javascript"></script>
    <script src="js/basemap_conf.js" type="text/javascript"></script>
    <script src="js/basemap_v3.js" type="text/javascript"></script>
    <script src="js/basemap_drawing.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/databrowser.js"></script>
    <script type="text/javascript" src="js/layer_info.js"></script>
    <link rel="stylesheet" href="css/vendor/jquery.mCustomScrollbar.min.css" />

    <script type="text/javascript" src="js/map_control.js"></script>
    <link rel="stylesheet" type="text/css" href="css/map_control.css"/>
</head>
<body>
	<div id="wrapper">
        <div id="resultslist">
            <div id="listdata">
                <div id="abstract">
                    <div>
                        Select a base layer on the right to explore
                        extent of data available. Use the drawing tools to
                        search across IEDA systems for available data
                    </div>
                </div>
                    <div id="data_layer_descriptions">
                        <h4>Base Layer Description</h4>
                        <div id="ec_desc" data-layer="EarthChem Portal">
                            <b>EarthChem Portal</b> - 
			</div>
                        <div id="mgds_desc" data-layer="MGDS Cruise Tracks">
                            <b>MGDS Cruise Tracks</b> - 
                        </div>
                        <div id="gc_desc" data-layer="Geochron">
                            <b>Geochron</b> - 
                        </div>
                        <div id="gmrt_desc" data-layer="GMRT High-Res">
                            <b>GMRT</b> - 
                        </div>
                        <div id="sesar_desc" data-layer="SESAR Samples">
                            <b>SESAR</b> - 
                        </div>
						<div id="seismic_desc" data-layer="Seismic Data">
							<b>Seismic Data</b>
						</div>
                    </div>
                <div id="ecresults" data-layer="EarthChem Portal"></div>
                <div id="mgdsresults" data-layer="MGDS Cruise Tracks"></div>
                <div id="gcresults" data-layer="Geochron"></div>
                <div id="gmrtresults" data-layer="GMRT High-Res"></div>
                <div id="sesarresults" data-layer="SESAR"></div>
				<!--<div id="seismicresults" data-layer="Seismic Data"></div>-->
            </div>
        </div>
		<div id="content">
			<div id="mapclient"></div>
		</div>
       
	</div>
     <form id="wesnvalues">
        <input type="hidden" id="west" />
        <input type="hidden" id="east" />
        <input type="hidden" id="south" />
        <input type="hidden" id="north" />
	<input type="hidden" id="boundspath" />
	<input type="hidden" id="boundbox" />
    </form>
</body>
</html>
