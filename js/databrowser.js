String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

function resize_window() {
    $('#content,#resultslist').height($(window).height()-2);
    $('#content').width($(window).width()-$('#resultslist').width());
    $("#listdata").mCustomScrollbar({
        theme: 'minimal-dark',
        scrollInertia: 0,
        mouseWheel:{scrollAmount:5}
    });
}

var requests = new Array();
$(document).ready(function(){
    resize_window();
    $(window).resize(function(){resize_window()});

    for (lyr_title in layer_info) {
	var desc = layer_info[lyr_title].description;
	var desc_div = $('#data_layer_descriptions div[data-layer="{0}"]'.format(lyr_title));
	desc_div.append(desc);	    
    } 

    mgdsMap = new MGDSMapClient();
    mgdsMap.mapInit();
    mgdsMap.LogoImage();
    mgdsMap.baseMap();
    mgdsMap.overlayWMS(
        "http://www.earthchemportal.org/ecpointswms?",
        'ECPoints',
        'EarthChem Portal',
        'image/gif',
        {
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            qurl: "/databrowser/inc/ecp_select_point.php?"
        },
        true,
        '<img src="http://ecp.iedadata.org/legend.jpg" alt="Map Legend" style="width:300px" />'
    );
    mgdsMap.overlayWMS(
        "http://www.marine-geo.org/tools/new_search/databrowser_wms.php?",
        'TracksAll',
        'MGDS Cruise Tracks',
        'image/png',
        {
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            qurl: "http://www.marine-geo.org/tools/new_search/databrowser_wms.php?"
        }
    );
    mgdsMap.overlayWMS(
        "http://www.geochron.org/cgi-bin/mapserv?map=/var/www/geochronmap.map&",
        'GeochronPoints',
        'Geochron',
        'image/png',
        {
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            qurl: "/databrowser/inc/geochron_select_point.php?"
        }
    );
    mgdsMap.overlayWMS(
        "http://gmrt.marine-geo.org/cgi-bin/mapserv?map=/public/mgg/web/gmrt.marine-geo.org/htdocs/services/map/wms_merc_mask.map",
        'topo-mask',
        'GMRT High-Res',
        'image/jpeg'
    );
    mgdsMap.overlayWMS(
        "http://prod-app.earthchem.org:8989/geoserver/SESAR/wms?SLD=http://" + document.location.hostname + "/sesar_sld.xml&",
        'SESAR:wfs_samples',
        'SESAR Samples',
        'image/png',
        {
            SERVICE: 'WMS',
            REQUEST: 'GetFeatureInfo',
            SRS: "EPSG:4326",
            VERSION: '1.0.0',
            WIDTH: '4',
            HEIGHT: '4',
            X: '2',
            Y: '2',
            INFO_FORMAT: 'application/json',
            QUERY_LAYERS: 'SESAR:wfs_samples',
            LAYERS: 'SESAR:wfs_samples',
            FEATURE_COUNT: '50',
            qurl: 'http://' + document.location.hostname + "/databrowser/inc/sesarwrapper.php?"
        },
        null,
        null,
        function(url,data,latlon,idx,name,tabs){
            return $.ajax({
                type: "GET",
                url: url,
                data: decodeURIComponent($.param(data)),
                dataType: "json",
                async: true,
                beforeSend: function(msg){
                    mgdsMap.map.setOptions({
                        draggableCursor: 'wait'
                    });
                },
                success: function(msg){
                    var content = '<div style="min-width:200px;text-align:left;">';
                    var k;
                    
                    for (k in msg.features) {
                        content += "<div style=\"margin-bottom:2px;\"><b>"+msg.features[k].properties.object_type+"</b> <a target=\"_blank\" href=\""+msg.features[k].properties.url+"\">"+msg.features[k].properties.object_name+"</a></div>";
                    }
                    content+="</div>";
                    /*$(msg).find("FIELDS").each(function(){
                        content += "<div class=\"tbox\" data-url=\"http://www.ngdc.noaa.gov/gazetteer/rest/feature/"+$(this).attr('OBJECTID')+"\">"
                            +"<!--<a class=\"turndown\">-->"+$(this).attr('NAME')+" "+$(this).attr('TYPE')+"<!-- <img alt=\"&gt;\" src=\"/imgs/arrow_show.gif\" /></a>-->"
                            +"<div class=\"tcontent\"></div>";
                            +"</div>";
                    });*/
                    if (msg.features.length > 0) {
                    	mgdsMap.new_tab(idx,name,content,tabs,latlon);
		    }

                }
            }).always(function(){
                mgdsMap.map.setOptions({
                        draggableCursor: 'crosshair'
                });
            });
        }
    );
    mgdsMap.overlayWMS(
            "http://www.marine-geo.org/services/mapserv7/seismic_data?"+$.param({"SLD":"http://dev.marine-geo.org/services/sld/databrowser_sld.xml"})+"&",
            'MGDS-DataSetsLines,MGDS-DataSets,MGDS-DataSets-Points,MGDS-DataObjects-OBS,MGDS-DataObjects-Points-OBS,MGDS-DataStations-OBS,UTIG-DataSet',
            'Seismic Data',
            'image/png',
            {
                SERVICE     : "WMS",
                REQUEST     : "GetFeatureInfo",
                SRS         : "EPSG:4326",
                QUERY_LAYERS: 'MGDS-DataSetsLines,MGDS-DataSets,MGDS-DataSets-Points,MGDS-DataObjects-OBS,MGDS-DataObjects-Points-OBS,MGDS-DataStations-OBS,UTIG-DataSet',
                WIDTH       : 4,
                HEIGHT      : 4,
                X           : 2,
                Y           : 2,
                VERSION     : "1.0.0",
                INFO_FORMAT : "gml",
                SLD         : "http://dev.marine-geo.org/services/sld/databrowser_sld.xml",
                qurl        : "/databrowser/inc/seismicClickEvent.php?"
            },
            true,
            null
        );
    //http://stg-db.earthchem.org:8989/geoserver/SESAR/wms?&REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.0.0&WIDTH=4&HEIGHT=4&X=2&Y=2&QUERY_LAYERS=SESAR:wfs_samples&LAYERS=SESAR:wfs_samples&STYLES=&INFO_FORMAT=application/json&FEATURE_COUNT=50&SRS=EPSG:4326&BBOX=-124.1015625,37.16031654673677,-122.6953125,38.272688535981
    $(document).on('click','.map-control-layer',function(){
        if (requests) {
            for (var i=0;i<requests.length;i++) {
                requests[i].abort();
            }
            requests = new Array();
        }
        //$('#data_layer_descriptions div').hide();
        //$("#ecresults,#gcresults,#mgdsresults,#gmrtresults,#sesarresults").html('');
	var title = $(this).attr('title');
	var desc_div = $('#data_layer_descriptions');
	desc_div.show();
        var description = desc_div.children('div[data-layer="{0}"]'.format(title));
	description.toggle();
	if (desc_div.children('div:visible').length > 0) {
		desc_div.show()
	} else {
		desc_div.hide();
	}
    });
    
    drawing = new drawingTools(mgdsMap.map);
    drawing.drawingmodes = [google.maps.drawing.OverlayType.RECTANGLE, google.maps.drawing.OverlayType.POLYGON];
    drawing.initiate();
    
    $(document).on('change', '#west, #east, #north, #south', function() {
	var w = $('#west').val();	
	var e = $('#east').val();	
	var s = $('#south').val();	
	var n = $('#north').val();

	var poly = [[w,s], [w,n], [e,n], [e,s], [w,s]];
	polygonSearch(poly);
	
    });

    var parsePolygon = function(str) {
        return str.split(',')
		.map(function(s) {
			return s.trim()
				.split(/[ ]+/)
				.map(function(s) {return parseInt(s,10)});
		     }
		);
    }
    var polygonToString = function(poly) {
    	return poly.map(function(pair) { return pair.join(' '); })
		.join(',');
    }

    $(document).on('change', "#boundspath",function(){
	var poly = $('#boundspath').val();	
	polygonSearch(parsePolygon(poly));
    });

    function polygonSearch(poly) {
        if (requests) {
            for (var i=0;i<requests.length;i++) {
                requests[i].abort();
            }
            requests = new Array();
        }
        $("#abstract").hide();
        $("#ecresults").html("<h4>EarthChem</h4><img src=\"images/throbber.gif\" />");
        $("#gcresults").html("<h4>Geochron</h4><img src=\"images/throbber.gif\" />");
        $("#mgdsresults").html("<h4>Marine-Geo</h4><img src=\"images/throbber.gif\" />");
	$("#gmrtresults").html("<h4>GMRT</h4><img src=\"images/throbber.gif\" />");
        $("#sesarresults").html("<h4>SESAR</h4><img src=\"images/throbber.gif\" />");
     
	var formatResultHeader = function(title, count) {
		return "<div class='result-header'><span class='result-title'>{0}</span><span class='result-count'>({1} results)</span></div>".format(title, count);
	}

	var formatResultBody = function(text,url) {
		return "<div>{0}</div><div><a href='{1}' target=\"_blank\">Explore &gt;&gt;&gt;</a></div>".format(text,url);
	}
 
	var polygon_str = polygonToString(poly);

	var polygon_rev = poly.map(function (arr) {return [arr[1], arr[0]];});
	var polygon_rev_str = polygonToString(polygon_rev);


	var wesn = mgdsMap.getContainingBBOX(poly);
	var wesn_str = "west={0}&east={1}&south={2}&north={3}".format(wesn.w, wesn.e, wesn.s, wesn.n);

        //Earthchem
        var ecurl = "http://ecp.iedadata.org/polygoncount?&polygon="+polygon_str;
        var ecsearchurl = "http://ecp.iedadata.org/polygonsearch?&polygon="+polygon_str;
        requests.push($.ajax({
            url: ecurl,
            dataType: "xml",
            success: function(ev){
                var total = $(ev).find("count[name='total']").first().attr('value');
                total = total?parseInt(total):0;
		var html = formatResultHeader("EarthChemPortal", total);
                if (total > 0) {
                    var reps = "";
                    $(ev).find("count:not([name='total'])").each(function(){
                        if (parseInt($(this).attr("value"))>0)
                            reps += $(this).attr('label')+ " ("+$(this).attr("value")+"), ";
                    });
                    reps = reps.substring(0,reps.length - 2);
                    html += formatResultBody(reps, ecsearchurl);
                }
		$('#ecresults').html(html);
            }
        }));
        //MGDS
        var mgdsurl = "http://www.marine-geo.org/tools/new_search/datasetservice.php?resulttype=hits&boundspath=POLYGON(({0}))".format(polygon_str);
        var mgdssearchurl = "http://www.marine-geo.org/tools/new_search/index.php?output_info_all=on&boundspath=POLYGON(({0}))".format(polygon_str);
        requests.push($.ajax({
            url: mgdsurl,
            dataType: "xml",
            success: function(ev){
                var total = parseInt($(ev).find("count").eq(0).text());
		var html = formatResultHeader("MGDS", total);
                if (total > 0) {
                    var dts = "";
                    $(ev).find("data_type:not([name='Other'])").each(function(){
                        if (parseInt($(this).attr("count"))>0)
                            dts += $(this).attr('name')+ " ("+$(this).attr("count")+"), ";
                    });
                    dts = dts.substring(0,dts.length - 2);
		    html += formatResultBody(dts, mgdssearchurl);
                }
		$('#mgdsresults').html(html);

            }
        }));
        //Geochron
        var gcurl = "http://www.geochron.org/polygoncount?polygon="+polygon_str;
        var gcsearchurl = "http://www.geochron.org/polygonsearch?polygon="+polygon_str;
        requests.push($.ajax({
            url: gcurl,
            dataType: "xml",
            success: function(ev){
                var total = parseInt($(ev).find("count[name='total']").first().attr('value'));
		var html = formatResultHeader("Geochron", total);
                if (total > 0) {
		    html += formatResultBody("", gcsearchurl);
                }
		$('#gcresults').html(html);
            }
        }));

	//GMRT
        var gmrtsearchurl = "http://www.marine-geo.org/tools/maps_grids.php?"+wesn_str;
        $("#gmrtresults").html("<h4>GMRT</h4><div><a href=\""+gmrtsearchurl+"\" target=\"_blank\">Generate a map/grid using GMRT MapTool &gt;&gt;&gt;</a></div>");
    
        //SESAR
        var sesarsearchurl = "http://www.geosamples.org/geosearch?polygon="+polygon_str;
        var sesarurl = "http://prod-app.earthchem.org:8989/geoserver/SESAR/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=SESAR:wfs_samples&resulttype=hits&srs=EPSG:4326&CQL_FILTER=INTERSECTS(SESAR:geom,POLYGON(({0})))".format(polygon_rev_str);
            requests.push($.ajax({
                url: sesarurl,
                dataType: "xml",
                timeout: 5000,
                success: function(ev){
                    var total = $(ev).find("*").first().attr('numberOfFeatures');
                    total = total?parseInt(total):0;
		    var html = formatResultHeader('SESAR Samples', total);
                    if (total > 0) {
			html += formatResultBody("", sesarsearchurl);
                    }
		    $('#sesarresults').html(html);
                },
                error: function(request,status, err){
                    if (status == "timeout") {
                        // timeout -> reload the page and try again
                        $("#sesarresults").html("<h4>SESAR Samples</h4><div>The area selected is too large for a SESAR search. Please select a smaller region.</div>");
                    }
                }
         }));
	
    }
    $(document).on("click",'.turndown', function() {
        var aself = this;
        var tbox = $(this).parent();
        var tcontent = tbox.children('.tcontent');
        var img;
        if (tcontent.is(':visible')) {
    	img = '/images/arrow_show.gif';
        } else {
    	img = '/images/arrow_hide.gif';
        }
        $(this).find('img').attr('src',img);
    
        if (!tbox.hasClass('has-content')) {
                $.ajax({
                    type: "GET",
                    url: 'http://ecp.iedadata.org/ged/'+$(this).parent().attr('data-uuid'),
                    success: function(msg){
                        tcontent.html(msg);
    		    tbox.addClass('has-content');
        		    tcontent.toggle();
                    }
                });
        } else {
    	    tcontent.toggle();
        }
    
    });

});
