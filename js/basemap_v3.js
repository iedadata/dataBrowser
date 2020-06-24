function MGDSMapClient() {
    var conf = configuration;
    this.maplat = conf.map_lat;
    this.maplon = conf.map_lon;
    this.zoom = conf.default_zoom;
    this.maxzoom = conf.max_zoom;
    this.minzoom = conf.min_zoom;
    this.mapdiv = conf.default_container;
    this.layers = new Array();
    this.mtoverlays = new Array();
    
    this.infowin = new google.maps.InfoWindow();
    var self = this;
    google.maps.event.addListener(this.infowin, 'closeclick', function(event) {
	self.marker.setMap(null);
    });
    
    this.marker = new google.maps.Marker();
    this.qurl = conf.query_url;
    this.markers = new Array();
    this.markerCluster = new Array();
    this.baseLayersbool = true;
    this.grat = null;
    this.mapdivobject = null;
    this.linkhref = conf.logo_href;
    this.linkclass = conf.logo_class;
    this.imgsrc = conf.logo_url;
    this.imgtitle = conf.logo_title;
    this.imgwidth = conf.logo_width;
}

MGDSMapClient.prototype.mapInit = function(hide,options,off) {
    var self = this;
    var basemap_options = {
	zoom: this.zoom,
	center: new google.maps.LatLng(this.maplat, this.maplon),
	mapTypeId: google.maps.MapTypeId.SATELLITE,
	streetViewControl: false,
	panControl: false,
	mapTypeControl: false,
	maxZoom: 22,
	minZoom: 1,
	scaleControl: true,
	draggableCursor:'crosshair'
    };
    if (options) {
	for (var attrname in options) {
	    basemap_options[attrname] = options[attrname];
	}
    }
    this.mapdivobject = $('#'+this.mapdiv);
    this.map = new google.maps.Map(document.getElementById(this.mapdiv),basemap_options);
    if (!off)
	this.controls = new controlOverlay(this,hide);
    this.posdiv = document.createElement('div');
    this.posdiv.id = 'latlondiv';
    this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(this.posdiv);
    this.oview = new google.maps.OverlayView();
    this.oview.draw = function() {};
    this.oview.onAdd = function(){};
    this.oview.onRemove = function(){};
    this.oview.setMap(this.map);
    this.movementTimer = null;
    this.mapdivobject.mousemove(function(evt){
        var posx = evt.pageX-self.mapdivobject.offset().left;
        var posy = evt.pageY-self.mapdivobject.offset().top;
        var latlng = getLatLngByOffset(self.oview,posx,posy);
        clearTimeout(this.movementTimer);
        this.movementTimer = setTimeout(function(){
            $.ajax({
                type: "GET",
                url: "http://www.marine-geo.org/services/pointserver.php",
                data: {
                    'latitude':latlng.lat().toFixed(6),
                    'longitude':latlng.lng().toFixed(6)
                },
                async: true,
                success: function(msg){
                    $("#elevdiv").text(msg+' m');
                }
            });
        }, 200);
        $('#latlondiv').html(getLocationText(latlng));
    });

}

MGDSMapClient.prototype.baseMap = function() {
    var d = new Date();
    var self = this;
    var copyrightDiv = document.createElement("div");
    copyrightDiv.id = "map-copyright";
    copyrightDiv.style.fontSize = "11px";
    copyrightDiv.style.fontFamily = "Arial, sans-serif";
    copyrightDiv.style.margin = "0 2px 2px 0";
    copyrightDiv.style.whiteSpace = "nowrap";
    copyrightDiv.innerHTML = "Bathymetry &copy;"+d.getFullYear()+" <a href='https://www.gmrt.org'>GMRT</a>";
    this.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(copyrightDiv);
    var tile = new TileData(this.map,'https://www.gmrt.org/services/mapserv/wms_merc?','topo');
    var gmrt_layer = {
	alt: " GMRT Basemap",
	getTileUrl: tile.GetTileUrl,
	isPng: false,
	maxZoom: 22,
	minZoom: 1,
	name: "Bathymetry",
	tileSize: new google.maps.Size(256, 256)
    };
    var tilemask = new TileData(this.map,'https://www.gmrt.org/services/mapserv/wms_merc_mask?','topo');
    var mask_layer = {
	alt: " GMRT Basemap",
	getTileUrl: tilemask.GetTileUrl,
	isPng: false,
	maxZoom: 22,
	minZoom: 1,
	name: "GMRT Mask",
	tileSize: new google.maps.Size(256, 256)
    };
    var bathymetry = new google.maps.ImageMapType(gmrt_layer);
    var gmrtmask = new google.maps.ImageMapType(mask_layer);
    this.map.mapTypes.set('Bathymetry',bathymetry);
    this.map.mapTypes.set('GMRT Mask',gmrtmask);
    this.map.setMapTypeId('Bathymetry');
}

MGDSMapClient.prototype.overlayControl = function(a,b,c,d,e){}

MGDSMapClient.prototype.LogoImage = function(linkhref,linkclass,imgsrc,imgtitle,imgwidth,attachnode) {
    if (linkhref) this.linkhref = linkhref;
    if (linkclass) this.linkclass = linkclass;
    if (imgsrc) this.imgsrc = imgsrc;
    if (imgtitle) this.imgtitle = imgtitle;
    if (imgwidth) this.imgwidth = imgwidth;
    var mgdsDiv = document.createElement("div");
    mgdsDiv.setAttribute("id",'mgdsDiv')
    var linklogo = document.createElement("a");
    linklogo.setAttribute("href",this.linkhref);
    linklogo.setAttribute("style","border-bottom:none !important;padding: 3px;display: block;");
    linklogo.className = this.linkclass;
    var clearDiv = document.createElement("div");
    clearDiv.setAttribute("style","clear:both;");
    linklogo.appendChild(clearDiv.cloneNode(true));
    var img = document.createElement("img");
    img.setAttribute("title",this.imgtitle);
    img.setAttribute("alt",this.imgtitle);
    img.setAttribute("src",this.imgsrc);
    img.setAttribute("style","width:"+this.imgwidth);
    linklogo.appendChild(img);
    linklogo.appendChild(clearDiv.cloneNode(true));
    mgdsDiv.appendChild(linklogo);
    var attdiv = document.createElement('div');
    attdiv.setAttribute("id","attdiv");
    if (attachnode) {
        attdiv.appendChild(attachnode);
    }
    mgdsDiv.appendChild(attdiv);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(mgdsDiv);
}

MGDSMapClient.prototype.overlayWMS = function(url,layer,name,format,clickevent,onoff,legend_url,clickcallback) {
    var tile = new TileData(this.map,url,layer);
    if (format)
	tile.format=format;
    this.mtoverlays[name] = new Array();
    this.mtoverlays[name]['wmslayer'] = {
	alt: name,
	getTileUrl: tile.GetTileUrl,
	isPng: false,
	maxZoom: 22,
	minZoom: 1,
	name: name,
	tileSize: new google.maps.Size(256, 256)
    };
    if (onoff)
	this.baseLayersbool = false;
    this.mtoverlays[name]['overlay'] = new google.maps.ImageMapType(this.mtoverlays[name]['wmslayer']);
    this.mtoverlays[name]['clickevent'] = clickevent;
    this.mtoverlays[name]['callback'] = clickcallback;
    if (legend_url) {
	this.mtoverlays[name]['legend_url'] = legend_url;
    }
    this.controls.baseLayer(name,this.baseLayersbool);
    this.baseLayersbool = false;	
}

MGDSMapClient.prototype.convertPoint = function(latLng) {
    var proj = this.oview.getProjection();
    var middle = proj.fromLatLngToContainerPixel(latLng);
    var ne = proj.fromContainerPixelToLatLng(new google.maps.Point(middle.x+2,middle.y-2));
    var sw = proj.fromContainerPixelToLatLng(new google.maps.Point(middle.x-2,middle.y+2));
    var bnds = sw.lng()+','+sw.lat()+','+((sw.lng()>ne.lng())?ne.lng()+360:ne.lng())+','+ne.lat();
    return bnds;
} 

MGDSMapClient.prototype.selectPoint = function(latlon) {
    var self = this;
    self.marker.setMap(null);
    self.infowin.close();

    var i;
    var mts = this.map.overlayMapTypes;
    var len = mts.getLength();
    var tabs = $('<div id="tabs"/>');
    var tab_links = $('<ul id="tab-links"/>');
    var tab_content = $('<div id="tab-content"/>');
    tabs.append(tab_links);
    tabs.append(tab_content);
    var requests = [];
    for (i = 0; i < len; i++) {
	requests.push(this.selectPointSingleLayer(i, latlon, tabs));
    }
    $.when.apply(undefined, requests).then(function () {
	if (!tab_content.is(':empty')) {	
	    tabs.tabs();
	    self.marker.setPosition(latlon);
	    self.marker.setMap(self.map);
	    self.infowin.setContent(tabs[0]);
	    self.infowin.open(self.map,self.marker);
	}
    });
}

MGDSMapClient.prototype.new_tab = function(idx, name, body, tabs, latlon) {
    var new_link = $('<li><a href="#tab{0}">{1}</a></li>'.format(idx, name));
    var new_tab= $('<div id="tab{0}" >{1}</div>'.format(idx,body));
    var tab_links = tabs.children('#tab-links');
    var tab_content = tabs.children('#tab-content');
    tab_links.append(new_link);
    tab_content.append(new_tab);
} 

MGDSMapClient.prototype.selectPointSingleLayer = function(idx, latlon, tabs) {
    var self = this;
    var mt = self.map.overlayMapTypes.getAt(idx);
    var layer = mt.name;
    if (layer && (self.mtoverlays[layer]['clickevent']|| self.mtoverlays[layer]['callback'])) {
	var str = '';
	var qurl = self.qurl;
	var data = $.extend({},self.mtoverlays[layer]['clickevent']);
	if (data['qurl']) {
	    qurl = data['qurl'];
	    delete data['qurl'];
	}
	if (data['SERVICE'] == 'WMS') {
	    data['BBOX'] = this.convertPoint(latlon);
	    str = decodeURIComponent($.param(data));
	} else {
	    data['lat'] = latlon.lat();
	    data['lon'] = latlon.lng();
	    data['zoom'] = this.map.getZoom();
	    str = decodeURIComponent($.param(data));
	}
        if (self.mtoverlays[layer]['callback']) {
            return self.mtoverlays[layer]['callback'](qurl,data,latlon,idx,layer,tabs);
        } else {
            return $.ajax({
                type: "GET",
                url: qurl,
                data: str,
                async: false,
                beforeSend: function(msg){
                    self.map.setOptions({
                        draggableCursor: 'wait'
                    });
                },
                success: function(msg) {
		    if (msg) {
			self.new_tab(idx,layer,msg,tabs);
		    }
                },
		error: function(e) { return ''; }
            }).always(function(){
                self.map.setOptions({
                    draggableCursor: 'crosshair'
                });
            });
        }
    }
}
MGDSMapClient.prototype.KMLOverlay = function(url,title,hide,zoomto,options) {
    this.layers[title] = new Array();
    this.layers[title]['url'] = url;
    this.layers[title]['preserveOverlay'] = (zoomto)?false:true;
    options = typeof options !== 'undefined' ? options : {};
    var opts = $.extend({preserveViewport:true},options);
    var onoff = (hide)?false:true;
    this.controls.overlayLayer(title,onoff,opts);
}
MGDSMapClient.prototype.ClusterOverlay = function(url,title,hide) {
    this.markerCluster[title] = new Array();
    this.markerCluster[title]['url'] = url;
    var onoff = (hide)?false:true;
    this.controls.clusterLayer(title,onoff);
}

MGDSMapClient.prototype.getContainingBBOX = function(poly) {
    var lon = poly.map(function(pt) { return pt[0] >= 0 ? pt[0] : pt[0] + 360; });
    var lat = poly.map(function(pt) { return pt[1]; });
    var w = Math.min.apply(undefined, lon);
    var e = Math.max.apply(undefined, lon);
    var s = Math.min.apply(undefined, lat);
    var n = Math.max.apply(undefined, lat);
    
    if (e - w > 180) {
	var tmp = e;
	e = w;
	w = tmp;
    }

    if (e > 180) {
	e -= 360;
    }
    if (w > 180) {
	w -= 360;
    }
    
    return { w:w, e:e, s:s, n:n };
}

function TileData(themap,baseUrl,layer) {
    var self = this;
    this.map = themap;
    this.baseUrl = baseUrl;
    this.format = "image/png";
    this.styles = '';
    this.layer=layer;
    this.baseOpts = "&REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1"
	+"&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&reaspect=false";
    this.GetTileUrl = function(tile, zoom) {
        var projection = self.map.getProjection();
        var zpow = Math.pow(2, zoom);
        var ur = new google.maps.Point( (tile.x+1)*256.0/zpow , (tile.y+1)*256.0/zpow );
        var ll = new google.maps.Point( tile.x*256.0/zpow , tile.y*256.0/zpow );
        var urw = projection.fromPointToLatLng(ur);
        var llw = projection.fromPointToLatLng(ll);
        var bbox;
        var lSRS;
        var urwlng = (urw.lng() == -180)? 180: urw.lng();
        var llwlng = (llw.lng() == 180)? -180: llw.lng();
        if (zoom < 5) {
            bbox=dd2MercMetersLng(llwlng)+","+dd2MercMetersLat(urw.lat())+","+dd2MercMetersLng(urwlng)+","+dd2MercMetersLat(llw.lat());
            lSRS="EPSG:3395";// use mercator projection when viewimg large areas
        } else {
            bbox = llwlng + ','+urw.lat()+','+urwlng+','+llw.lat();
            lSRS="EPSG:4326";// use geographic projection when viewing details
        }
        var lURL = self.baseUrl + self.baseOpts
            +"&LAYERS="+self.layer
            +"&STYLES="+self.styles
            +"&FORMAT="+self.format
            +"&SRS="+lSRS
            +"&BBOX="+bbox
        //console.log(lURL);
        return lURL;
    }
}

function controlOverlay(mapClient,hide) {
    var self = this;
    this.mapClient = mapClient;
    this.map = mapClient.map;
    this.bases = false;
    this.overlays = false;
    this.clusters = false;

    this.map_control = new MapControl();

    var gratBtn = $(this.map_control.getImgButton('graticule'));
    gratBtn.on('turn-on', function() {
	mapClient.grat = new Graticule(mapClient.map);
    });
    gratBtn.on('turn-off', function() {
	mapClient.grat.setMap(null);
	mapClient.grat = null;
    });

    var maskBtn = $(this.map_control.getImgButton('mask'));
    maskBtn.on('turn-on', function() {
	mapClient.map.setMapTypeId('GMRT Mask');
    });
    maskBtn.on('turn-off', function() {
	mapClient.map.setMapTypeId('Bathymetry');
    });

    var merc = $(this.map_control.getImgButton('mercator'));
    merc.addClass('on');
    merc.removeClass('toggle');

    this.mapClient.map.controls[google.maps.ControlPosition.RIGHT].push(this.map_control.getElement());
}

controlOverlay.prototype.legendLayer = function(html) {
    if (!html) return;
    
    if (html) {
	this.legendDiv = document.createElement("div");
	this.legendDiv.className = "legendcontrol";
	this.legendDiv.innerHTML = '<div class="tabwrapper"><div class="tabboxlegend tabbox">Legend</div></div>';
	this.limgDiv = document.createElement("div");
	this.limgDiv.className = "maplegend";
	this.limgDiv.innerHTML = html;
	this.legendDiv.appendChild(this.limgDiv);
	this.mapClient.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(this.legendDiv);
	$(document).off('click','.tabboxlegend');
	$(document).on('click','.tabboxlegend',function(){
	    if ($(".legendcontrol .maplegend").is(":visible")) {
		$(".legendcontrol .maplegend").hide();
	    } else {
		$(".legendcontrol .maplegend").show();
	    }
	});
    }
}

controlOverlay.prototype.baseLayer = function(title,onoff) { 
    var self = this;

    this.map_control.addLayer(title);
    var btn = this.map_control.getLayerButton(title);
    $(btn).on('turn-on', function() {
	var idx = $(this).attr('title');
	var overlays = self.mapClient.map.overlayMapTypes;
	self.mapClient.mtoverlays[idx]['overlay'] = new google.maps.ImageMapType(self.mapClient.mtoverlays[idx]['wmslayer']);
	overlays.insertAt(0, self.mapClient.mtoverlays[idx]['overlay']);
	var legend_url = self.mapClient.mtoverlays[idx]['legend_url'];
	if (legend_url) {
	    self.legendLayer(legend_url);
	}
    });
    $(btn).on('turn-off', function() {
	var idx = $(this).attr('title');
	var overlays = self.mapClient.map.overlayMapTypes;
	var i;
	var len = overlays.getLength();
	for (i = 0; i < len; i++) {
	    var overlay = overlays.getAt(i);
	    if (overlay.name === idx) {
		overlays.removeAt(i);
		break;
	    }	
	}
	var legend_url = self.mapClient.mtoverlays[idx]['legend_url'];
	if (legend_url) {
	    $('.legendcontrol').remove();
	}
    });
    
    if (!this.bases) {
	//this.layersDiv.appendChild(this.basediv);
	google.maps.event.addListener(self.mapClient.map, 'click', function(event) {
	    self.mapClient.selectPoint(event.latLng);
	});
	this.bases=true
    }
    
    if (onoff) {
	self.mapClient.map.overlayMapTypes.clear();
	self.mapClient.map.overlayMapTypes.insertAt(0,self.mapClient.mtoverlays[title]['overlay']);
	self.legendLayer(self.mapClient.mtoverlays[title]['legend_url']);
    }
}

controlOverlay.prototype.overlayLayer = function(title,onoff,opts) {
    var self = this;
    var layerDiv = document.createElement("div");
    layerDiv.className = "layerdiv overlay"+((onoff)?'':' off');
    layerDiv.title = title;
    layerDiv.style.backgroundColor = (onoff)?'#BBBBBB':'#FFFFFF';
    layerDiv.innerHTML = title;
    this.overlayLayers.appendChild(layerDiv);
    if (!this.overlays) {
	if (!this.clusters)
	    this.layersDiv.appendChild(this.overlaydiv);
	$(document).on('click','.overlay',function(){
	    var idx = $(this).attr('title');
	    if ($(this).hasClass('off')) {
		$(this).removeClass('off');
		$(this).css('background-color','#BBBBBB');
		var url = self.mapClient.layers[idx]['url'];
		self.mapClient.layers[idx]['overlay'] = new google.maps.KmlLayer(url,opts);
		self.mapClient.layers[idx]['overlay'].setMap(self.mapClient.map);
	    } else {
		if( self.mapClient.layers[idx]['overlay'].getMap() ){
		    $(this).css('background-color','#FFFFFF');
		    self.mapClient.layers[idx]['overlay'].setMap(null);
		}else{
		    $(this).css('background-color','#BBBBBB');
		    self.mapClient.layers[idx]['overlay'].setMap(self.mapClient.map);
		}
	    }
	});
	this.overlays=true
    }
    if (onoff) {
	var url = self.mapClient.layers[title]['url'];
	self.mapClient.layers[title]['overlay'] = new google.maps.KmlLayer(url,{preserveViewport:self.mapClient.layers[title]['preserveOverlay']});
	self.mapClient.layers[title]['overlay'].setMap(((onoff)?self.mapClient.map:null));
    }
    
}

controlOverlay.prototype.clusterLayer = function(title,onoff) {
    var self = this;
    onoff = false; //Clusters really should not be on by default
    var layerDiv = document.createElement("div");
    layerDiv.className = "layerdiv cluster"+((onoff)?'':' off');
    layerDiv.title = title;
    layerDiv.style.backgroundColor = (onoff)?'#BBBBBB':'#FFFFFF';
    layerDiv.innerHTML = title;
    //this.clusterLayers.appendChild(layerDiv);
    this.overlayLayers.appendChild(layerDiv);
    if (!this.clusters) {
	if (!this.overlays)
	    this.layersDiv.appendChild(this.overlaydiv);
	$(document).on('click','.cluster',function(){
	    var me = this;
	    var idx = $(this).attr('title');
	    if ($(me).hasClass('off')) {
		$(me).html('Loading...');
		$(me).removeClass('off');
		$(me).css('background-color','#BBBBBB');
		var url = self.mapClient.markerCluster[idx]['url'];
		self.mapClient.markers[idx] = new Array();
		$.ajax({ url: url, dataType: 'json',
			 success: function(data) {
			     $.each(data,function(key,val){
				 var latLng = new google.maps.LatLng(val.lat,val.lon);
				 var marker = new google.maps.Marker({
				     position: latLng,
				     content: val.content,
				     icon: {
					 url:"http://www.marine-geo.org/images/red_dot.png",
					 size: new google.maps.Size(8,8),
					 anchor: new google.maps.Point(4,4)
				     }
				 });
				 self.mapClient.markers[idx].push(marker);
				 google.maps.event.addListener(marker, 'click', function () {
				     self.mapClient.infowin.setContent(marker.content);
				     self.mapClient.infowin.open(self.mapClient.map, marker);
				 });

			     });
			     self.mapClient.markerCluster[idx]['overlay'] = new MarkerClusterer(self.mapClient.map, self.mapClient.markers[idx],{minimumClusterSize:4});
			     $(me).html(idx);
			 }
		       });
	    } else {
		if( self.mapClient.markerCluster[idx]['overlay'].getTotalMarkers() ){
		    this.style.backgroundColor = '#FFFFFF';
		    self.mapClient.markerCluster[idx]['overlay'].clearMarkers();
		}else{
		    this.style.backgroundColor = '#BBBBBB';
		    self.mapClient.markerCluster[idx]['overlay'].addMarkers(self.mapClient.markers[idx]);
		}
	    }
	});
	this.overlays=true;
	this.clusters=true;
    }
}

// Adapted from Bill Chadwick 2006
// This work is licensed under the Creative Commons Attribution 3.0 Unported
// http://creativecommons.org/licenses/by/3.0/
var Graticule = (function() {
    function _(map) {
        // default to decimal intervals
        this.set('container', document.createElement('DIV'));
        this.show();
        this.setMap(map);
    }
    _.prototype = new google.maps.OverlayView();
    _.prototype.addDiv = function(div) {
        this.get('container').appendChild(div);
    },
    _.prototype.onAdd = function() {
        var self = this;
        this.getPanes().mapPane.appendChild(this.get('container'));
        function redraw() {
            self.draw();
        }
        this.idleHandler_ = google.maps.event.addListener(this.getMap(), 'idle', redraw);

        function changeColor() {
            self.draw();
        }
        changeColor();
        this.typeHandler_ = google.maps.event.addListener(this.getMap(), 'maptypeid_changed', changeColor);
    };
    _.prototype.clear = function() {
        var container = this.get('container');
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
    };
    _.prototype.onRemove = function() {
        this.get('container').parentNode.removeChild(this.get('container'));
        this.set('container', null);
        google.maps.event.removeListener(this.idleHandler_);
        google.maps.event.removeListener(this.typeHandler_);
    };
    _.prototype.show = function() {
        this.get('container').style.visibility = 'visible';
    };
    _.prototype.hide = function() {
        this.get('container').style.visibility = 'hidden';
    };
    function gridPrecision(dDeg) {
        if (dDeg < 0.01) return 3;
        if (dDeg < 0.1) return 2;
        if (dDeg < 1) return 1;
        return 0;
    }
    function leThenReturn(x, l, d) {
        for (var i = 0; i < l.length; i += 1) {
            if (x <= l[i]) {
                return l[i];
            }
        }
        return d;
    }
    var numLines = 10;
    function latLngToPixel(overlay, lat, lng) {
	return overlay.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
    };
    function gridInterval(dDeg, mins) {
        return leThenReturn(Math.ceil(dDeg / numLines * 6000) / 100, mins,
                            60 * 45) / 60;
    }
    function makeLabel(color, x, y, text) {
        var d = document.createElement('DIV');
        var s = d.style;
        s.position = 'absolute';
        s.left = x+'px';
	s.top = y+'px';
        s.color = color;
        //s.width = '3em';
        s.fontSize = '.8em';
        s.whiteSpace = 'nowrap';
        d.innerHTML = text;
        return d;
    };
    function createLine(x, y, w, h, color) {
        var d = document.createElement('DIV');
        var s = d.style;
        s.position = 'absolute';
        s.overflow = 'hidden';
        s.backgroundColor = color;
        s.opacity = 0.3;
        var s = d.style;
        s.left = x+'px';
        s.top = y+'px';
        s.width = w+'px';
        s.height = h+'px';
        return d;
    };
    var span = 50000;
    function meridian(px, color) {
        return createLine(px, -span, 1, 2 * span, color);
    }
    function parallel(py, color) {
        return createLine(-span, py, 2 * span, 1, color);
    }
    function eqE(a, b, e) {
        if (!e) {
            e = Math.pow(10, -6);
        }
        if (Math.abs(a - b) < e) {
            return true;
        }
        return false;
    }
    // Redraw the graticule based on the current projection and zoom level
    _.prototype.draw = function() {
        var color = '#fff';
        this.clear();
        if (this.get('container').style.visibility != 'visible') {
            return;
        }
        // determine graticule interval
        var bnds = this.getMap().getBounds();
        if (!bnds) {
            // The map is not ready yet.
            return;
        }
        var sw = bnds.getSouthWest();
        var ne = bnds.getNorthEast();
        var l = sw.lng();
        var b = sw.lat();
        var r = ne.lng();
        var t = ne.lat();
        if (l == r) { l = -180.0; r = 180.0; }
        if (t == b) { b = -90.0; t = 90.0; }

        // grid interval in degrees
        var mins = [0.06,0.12,0.3,0.6,1.2,3,6,12,30,60,120,300,600,1200,1800];
        var dLat = gridInterval(t - b, mins);
        var dLng = gridInterval(r > l ? r - l : ((180 - l) + (r + 180)), mins);

        // round iteration limits to the computed grid interval
        l = Math.floor(l / dLng) * dLng;
        b = Math.floor(b / dLat) * dLat;
        t = Math.ceil(t / dLat) * dLat;
        r = Math.ceil(r / dLng) * dLng;
        if (r == l) l += dLng;
        if (r < l) r += 360.0;
        var y = latLngToPixel(this, b + dLat, l).y + 2;

        // lo<r to skip printing 180/-180
        for (var lo = l; lo < r; lo += dLng) {
            if (lo > 180.0) {
                r -= 360.0;
                lo -= 360.0;
            }
            var px = latLngToPixel(this, b, lo).x;
            this.addDiv(meridian(px, color));
            this.addDiv(
		makeLabel(
		    color,
		    px + 3,
		    y - 20,
		    lo.toFixed(gridPrecision(dLng))+'&deg;'
		)
	    );
        }
        var x = latLngToPixel(this, b, l + dLng).x + 3;
        for (; b <= t; b += dLat) {
            var py = latLngToPixel(this, b, l).y;
            this.addDiv(parallel(py, color));
            this.addDiv(
		makeLabel(
		    color,
		    x,
		    py + 1,
		    b.toFixed(gridPrecision(dLat))+'&deg;'
		)
	    );
        }
    };
    return _;
})();

//Additional functions
function getLatLngByOffset( view, offsetX, offsetY ){
    return view.getProjection().fromContainerPixelToLatLng( new google.maps.Point(offsetX,offsetY) );
}
function latLngToPixel(view, lat, lng) {
    return view.getProjection().fromLatLngToDivPixel( new google.maps.LatLng(lat, lng) );
};
function getLocationText(location) {
    return 'lon: ' + location.lng().toFixed(6) + '<br />lat: ' + location.lat().toFixed(6) + '<br />elev: <span id="elevdiv"></span>';
}
function dd2MercMetersLng(p_lng) {
    return 6378137.0*(p_lng*Math.PI/180);
} 
function dd2MercMetersLat(p_lat) {
    p_lat = ((p_lat > 85)?85:((p_lat<-85)?-85:p_lat));
    return 6378137.0*Math.log(Math.tan(((p_lat*Math.PI/180)+(Math.PI/2.0))/2.0));
}
