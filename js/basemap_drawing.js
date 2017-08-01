function drawingTools(map) {
	this.map = map;
	this.defaultoptions = {
		fillColor: '#ff0000',
		fillOpacity: 0.1,
		strokeWeight: 5,
		clickable: false,
		draggable: true,
		zIndex: 1,
		editable: true
	};
	this.rectoptions = this.defaultoptions;
	this.circleoptions = this.defaultoptions;
	this.polyoptions = this.defaultoptions;
	this.polyoptions['geodesic'] = false;
	this.overlay = null;
	this.path = null;
        this.defaultmode = null;
	this.drawingmodes = [google.maps.drawing.OverlayType.POLYGON,google.maps.drawing.OverlayType.RECTANGLE];
	this.drawingManager = null;
}

drawingTools.prototype.initiate = function() {
	var self = this;
	this.drawingManager = new google.maps.drawing.DrawingManager({
	  drawingMode: this.defaultmode,
	  drawingControl: true,
	  drawingControlOptions: {
		position: google.maps.ControlPosition.TOP_CENTER,
		drawingModes: this.drawingmodes
	  },
	  circleOptions: this.circleoptions,
	  rectangleOptions: this.rectoptions,
	  polygonOptions: this.polyoptions
	});
	this.drawingManager.setMap(this.map);
	google.maps.event.addListener(this.drawingManager, 'rectanglecomplete', function(event){
		self.new_rectangle(event);
		self.rectools();
	});
	google.maps.event.addListener(this.drawingManager, 'polygoncomplete', function(event){
		self.new_rectangle(event);
		self.polytools();
	});
}
drawingTools.prototype.end = function() {
    var self = this;
    this.drawingManager.setMap(null);
    this.overlay.setMap(null);
    delete this.drawingManager;
    delete this.overlay;
}
drawingTools.prototype.rectools = function() {
	var self = this;
	var bounds = this.overlay.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	$("#west,#westbound").val(sw.lng().toFixed(4));
	$("#east,#eastbound").val(ne.lng().toFixed(4));
	$("#south,#southbound").val(sw.lat().toFixed(4));
	$("#north,#northbound").val(ne.lat().toFixed(4));
	$("#west,#westbound").change();
	$("#boundspath").val('');
	$("#boundpoly").hide();
	$("#boundbox").show();
	google.maps.event.clearInstanceListeners(this.overlay);
	google.maps.event.addListener(this.overlay, 'bounds_changed', function(event){self.rectools();});
}

drawingTools.prototype.polytools = function() {
	var self = this;
	self.path = this.overlay.getPath();
	var str = ""
	var path1;
	self.path.forEach(function(item,index){
		if (index == 0) {path1 = item;}
		str += item.lng().toFixed(4)+' '+item.lat().toFixed(4)+',';
	});
	str += path1.lng().toFixed(4)+' '+path1.lat().toFixed(4);
	$("#boundspath").val(str);
    $("#boundspath").change();
	$("#west,#east,#south,#north").val('');
	$("#boundbox").hide();
	$("#boundpoly").show();
	google.maps.event.clearInstanceListeners(self.path);
	google.maps.event.addListener(self.path, 'set_at', function(event){self.polytools();});
	google.maps.event.addListener(self.path, 'insert_at', function(event){self.polytools();});
}

drawingTools.prototype.new_rectangle = function(rect){
	if (this.overlay) {
		this.overlay.setMap(null);
	}
	this.drawingManager.setDrawingMode(null);
	this.overlay = rect;
}

drawingTools.prototype.rectangle_select = function(wesn){
	var opts = this.rectoptions;
	opts['bounds'] = new google.maps.LatLngBounds(
		new google.maps.LatLng(wesn[2], wesn[0]),
		new google.maps.LatLng(wesn[3], wesn[1])
	);
	this.new_rectangle(new google.maps.Rectangle(opts));
	this.overlay.setMap(this.map);
	this.map.fitBounds(opts['bounds']);
	this.rectools();
}
