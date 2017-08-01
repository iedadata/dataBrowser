<!DOCTYPE html>
<html>
  <head>
    <title>IEDA: Data Browser</title>
    <meta name="Description" content="The IEDA Data Browser provides a quick, intuitive interface for finding and visualizing the data available through IEDA." />
    <meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="css/mapv3.css?a=1&b=2" media="all" />
    <link rel="shortcut icon" href="http://www.iedadata.org/sites/www.iedadata.org/files/arthemia_favicon.gif" type="image/x-icon"/>
    <link rel="stylesheet" type="text/css" href="/bower_components/jquery-ui/themes/base/jquery-ui.min.css"/>
    <link rel="stylesheet" type="text/css" href="css/spdatabrowser.css" />
    <link rel="stylesheet" href="http://openlayers.org/en/v3.12.1/css/ol.css" type="text/css"/>
    <link rel="stylesheet" href="/bower_components/ol3-layerswitcher/src/ol3-layerswitcher.css" />
    <script type="text/javascript" src="/inc/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="/bower_components/jquery-ui/jquery-ui.min.js"></script>

    <script type="text/javascript" src="/inc/malihu-custom-scrollbar-plugin-3.0.6/jquery.mCustomScrollbar.concat.min.js"></script>
    <link rel="stylesheet" href="/inc/malihu-custom-scrollbar-plugin-3.0.6/jquery.mCustomScrollbar.css">

    <script src="http://openlayers.org/en/v3.9.0/build/ol-debug.js" type="text/javascript"></script>
    <script src="/bower_components/proj4/dist/proj4-src.js" type="text/javascript"></script>
    <script src="js/basemap_conf.js" type="text/javascript"></script>
    <script src="js/basemap_v3.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/spdatabrowser.js"></script>
    <script type="text/javascript" src="/bower_components/ol3-layerswitcher/src/ol3-layerswitcher.js"></script>
    <script type="text/javascript" src="/bower_components/ol3-popup/src/ol3-popup.js"></script>
    <script type="text/javascript" src="/databrowser/js/layer_info.js"></script>
    
    <script type="text/javascript" src="/databrowser/js/map_control.js"></script>
    <link rel="stylesheet" type="text/css" href="/databrowser/css/map_control.css"/>

    <script type="text/javascript" src="/bower_components/jquery-bbq-deparam/jquery-deparam.js"></script>
    
  </head>
  <body>
    <div id="wrapper">
      <div id="resultslist">
        <div id="listdata">
          <div id="abstract">
            <div>
              Select base layer(s) on the right to explore
              extent of data available. Use the drawing tools to
              search across IEDA systems for available data
            </div>
          </div>
          <div id="data_layer_descriptions">
            <h4>Base Layer Description</h4>
          </div>
          <div id="ecresults" data-layer="EarthChem Portal"></div>
          <div id="mgdsresults" data-layer="MGDS Cruise Tracks"></div>
          <div id="gcresults" data-layer="Geochron"></div>
          <div id="gmrtresults" data-layer="GMRT High-Res"></div>
          <div id="sesarresults" data-layer="SESAR"></div>
	  <div id="usapresults" data-layer="USAP"></div>
        </div>
      </div>
      <div id="content">
	<div id="mapclient">
	  <div id="iedaLogo" style="position: absolute; top: 0.5em; left: 0.5em">
            <a href="http://www.iedadata.org" class="iedalogo">
              <img title="IEDA: Interdisciplinary Earth Data Alliance" alt="IEDA: Interdisciplinary Earth Data Alliance" src="/images/ieda_maplogo.png" style="width:220px">
            </a>
	  </div>
	</div>
	<div id="drawing-buttons">
	  <div id="drag-icon" data-mode="None" class="drawing-button draw-active"><img src="/images/drag-icon.png"/></div>
	  <div id="rect-icon" data-mode="Box" class="drawing-button"><img src="/images/rectangle-icon.png"/></div>
	  <div id="polygon-icon" data-mode="Polygon" class="drawing-button"><img src="/images/Maps-Polygon-icon.png"/></div>
	</div>
      </div>
      <form id="wesnvalues">
        <input type="hidden" id="polygon" />
      </form>
  </body>
</html>
