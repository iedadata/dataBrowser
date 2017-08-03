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

    mgdsMap = new MGDSMapClient();
    mgdsMap.mapInit();
    //mgdsMap.LogoImage();
    
    //$(document).on('change',"#polygon",
    document.addEventListener('polygon-change', function(e) {
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
	
	var polygonToString = function(coords, sep) {
	    if (!sep) { sep = ','; }
	    return coords.map(function(pt) {
		return "{0} {1}".format(pt[0], pt[1]);
	    }).join(sep);
	}
	var polygon = e.detail;
	var poly_str = polygonToString(polygon);
	var poly_rev_str = polygonToString(polygon.map(function(pt) { return [pt[1], pt[0]] }));
	var poly_rev_str_no_commas = polygonToString(polygon.map(function(pt) { return [pt[1], pt[0]] }), ' ');
	var poly_str_no_commas = polygonToString(polygon, ' ');
	
	var wesn = mgdsMap.getContainingBBOX(polygon);
	var wesn_str = "west={0}&east={1}&south={2}&north={3}".format(wesn.w, wesn.e, wesn.s, wesn.n);
	
	var formatResultHeader = function(title, count) {
	    return "<div class='result-header'><span class='result-title'>{0}</span><span class='result-count'>({1} results)</span></div>".format(title, count);
	}

	var formatResultBody = function(text,url) {
	    return "<div>{0}</div><div><a href='{1}' target=\"_blank\">Explore &gt;&gt;&gt;</a></div>".format(text,url);
	}
    var formatResultPost = function(text,url,post) {
        var divel = $('<div/>').html(text);
        var form = $('<form/>').attr({
            'target' : "_blank",
            'action' : url,
            'method': "post"
        });
        $.each(post,function(key,value){
            form.append($("<input/>").attr({
                //"name" : "spatial_bounds_interpolated",
                "name" : key,
                "type" : "hidden",
                "value" : value
            }));
        });
        form.append($("<a/>").attr({
            "href": "#",
            "onclick":"event.preventDefault();this.parentNode.submit();"
        }).html("Explore &gt;&gt;&gt;"));
        
        return $("<div/>").append(divel).append(form);
	}
	
	//Earthchem
	var ecurl = "http://ecp.iedadata.org/polygoncount?srs=3031&polygon="+poly_str;
	var ecsearchurl = "http://ecp.iedadata.org/polygonsearch?srs=3031&polygon="+poly_str;
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
	var mgdsurl = "http://www.marine-geo.org/tools/new_search/datasetservice.php?srs=EPSG:3031&resulttype=hits&boundspath=POLYGON(({0}))".format(poly_str);
	var mgdssearchurl = "http://www.marine-geo.org/tools/new_search/index.php?srs=EPSG:3031&output_info_all=on&boundspath=POLYGON(({0}))".format(poly_str);
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
	var gcurl = "http://www.geochron.org/polygoncount?&srs=3031&polygon="+poly_str;
	var gcsearchurl = "http://www.geochron.org/polygonsearch?srs=3031&polygon="+poly_str;
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

	//USAP
	var usap_url = "/databrowser/inc/usap_pass_through.php?wkt=POLYGON(("+poly_str+"))";
	//var gcsearchurl = "http://www.geochron.org/polygonsearch?srs=3031&polygon="+poly_str;
	requests.push($.ajax({
	    url: usap_url,
	    success: function(ev) {
		var data = JSON.parse(ev);
		var total = 0;
		var text_pieces = [];
		for (var i = 0; i < data.length; i++) {
		    total += data[i].count;
		    // Ignore the 'Antarctic ' part at the beginning of each program name
		    text_pieces.push(data[i].program.slice(10) + ' (' + data[i].count + ')');
		}
		var text = text_pieces.join(',')
		var html = formatResultHeader("USAP", total);
		var resultsearch = formatResultPost(text, "http://www.usap-dc.org/search",{
            "spatial_bounds_interpolated":"POLYGON(("+poly_str+"))"
        });
        html += resultsearch.prop("outerHTML");
		$('#usapresults').html(html);
	    }
	}));

	//GMRT
        var gmrtsearchurl = "http://www.marine-geo.org/tools/maps_grids.php?"+wesn_str;
        $("#gmrtresults").html("<h4>GMRT</h4><div><a href=\""+gmrtsearchurl+"\" target=\"_blank\">Generate a map/grid using GMRT MapTool &gt;&gt;&gt;</a></div>");

	//SESAR
	var sesarsearchurl = "http://www.geosamples.org/geosearch?srs=3031&polygon="+poly_str;
	var sesarurl = "/databrowser/inc/sesar_polygon_wrapper.php?polygon={0}&srs=3031&hide_private=1&limit=1&page_no=1".format(poly_str);
	//var sesarurl = "http://dev-app.iedadata.org/spdatabrowser/inc/sesar_polygon_wrapper.php?&srs=3031&hide_private=1&limit=1&page_no=1&polygon="+poly_str;
	
	requests.push($.ajax({
	    url: sesarurl,
	    success: function(str){
		
		var doc = $($.parseHTML(str));
		var totalText = doc.children('p').first().html();
		var total = 0;
		if (totalText) {
		    total = parseInt(totalText.split(': ')[1]);
		}
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

	
    });

});
