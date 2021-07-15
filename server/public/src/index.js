const $ = require("jquery")
const L = require("leaflet")

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(leaflet_map);

leaflet_map.on("moveend", function() { update_lsoa(); });

function lerp(a,b,t) {
    return a*(1-t)+b*t;
}

function zoom_to_tol(zoom) {
    let t = zoom/18;
    return lerp(0.001,0.000001,t);
}

//console.log(zoom_to_tol(1));  // zoomed out = 0.005
//console.log(zoom_to_tol(17)); // zoomed in = 0.0001

var lsoa_zones = []

function lsoa_zones_include(name,zones) {
	for (let zone of zones) {
		if (zone.name==name) return true;
	}
	return false;
}

function remove_lsoa_zone(name,zones) {
	let new_zones=[]
	for (let zone of zones) {
		if (name!=zone.name) {
			new_zones.push(zone);
		}
	}
	return new_zones;
}

function arr2avg(arr) {
	let ret=0;
	for (let v of arr) {
		ret+=v;
	}
	return ret/arr.length
}

var graph_scale=8;

function redraw_graph(graph_data,scale) {
	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttributeNS(null, 'width', "100%")
	svg.setAttributeNS(null, 'height', "50%")
	svg.setAttributeNS(null, 'viewBox', '0 0 800 200')

 	let add_bar=function(x,y,w,h,label) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-h)
		c.setAttributeNS(null, 'width', w)
		c.setAttributeNS(null, 'height', h)
		c.setAttributeNS(null, 'fill', "#4c9f70")
		svg.appendChild(c)
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(label);
		c.setAttributeNS(null, 'x', x+10)
		c.setAttributeNS(null, 'y', y+30)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "25");
		c.appendChild(myText);
		svg.appendChild(c);		
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(""+(h/scale).toFixed(2));
		c.setAttributeNS(null, 'x', x+20)
		c.setAttributeNS(null, 'y', y-h+20)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.appendChild(myText);
		svg.appendChild(c);		
	}

 	let add_line=function(x1,y1,x2,y2,w,s) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		c.setAttributeNS(null, 'x1', x1)
		c.setAttributeNS(null, 'y1', y1)
		c.setAttributeNS(null, 'x2', x2)
		c.setAttributeNS(null, 'y2', y2)
		c.setAttributeNS(null, 'stroke', s)
		svg.appendChild(c)
	}

	let add_text=function(x,y,t) {
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(t);
		c.setAttributeNS(null, 'x', x+10)
		c.setAttributeNS(null, 'y', y+30)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.appendChild(myText);
		svg.appendChild(c);		
	}

	let add_sideways_text=function(x,y,t) {
		var c = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var myText = document.createTextNode(t);
		c.setAttributeNS(null, 'x', 0)
		c.setAttributeNS(null, 'y', 0)
		c.setAttributeNS(null, 'fill', "#42273b")
		c.setAttribute("font-size", "15");
		c.setAttribute("transform", "translate("+x+","+y+") rotate(-90)");
		c.appendChild(myText);
		svg.appendChild(c);		
	}
	
	let decades = {};
	
	for (let year of graph_data) {
		let dec = Math.floor((year.year%2000)/10);
		if (decades[dec]==undefined) {
			decades[dec]=[year.avg]
		} else {
			decades[dec].push(year.avg)
		}
	}

	for (let dec of Object.keys(decades)) {
		decades[dec]=arr2avg(decades[dec])
	}
	
	let minimum = 999999;
	let maximum = 0;

	for (let dec of Object.keys(decades)) {
		if (minimum>decades[dec]) minimum = decades[dec]
		if (maximum<decades[dec]) maximum = decades[dec]
	}
	
	
	let graph_width = 650;
	let graph_height = 200;
	let bar_width = graph_width/Object.keys(decades).length;

	let x=100
	for (let dec of Object.keys(decades)) {
		add_bar(x,170,bar_width-2,decades[dec]*scale,"20"+dec+"0");
		x+=bar_width;
	}

	add_line(90,175,790,175,1,"#000")
	add_line(90,175,90,5,1,"#000")

	for (let i=0; i<5; i++) {
		let p = i*(graph_height/5);
		add_text(50,(graph_height-p)-55,""+(p/scale));		
	}

	let data_type=$("#graph-type").val()
	if(data_type=="daily_precip") {
		add_sideways_text(40,150,"Millimetres per day");		
	}
	if(data_type=="mean_temp" ||
	   data_type=="max_temp" ||
	   data_type=="min_temp") {
		add_sideways_text(40,150,"Degrees celsius");		
	}
	if(data_type=="mean_windspeed" ||
	   data_type=="max_windspeed" ||
	   data_type=="min_windspeed") {
		add_sideways_text(40,150,"Metres per second");		
	}
	
	$("#graph").empty();
	$("#graph").append(svg);
}

function update_graph() {
	zones = []
	for (let zone of lsoa_zones) {
		if (zone.tile!=undefined && !zones.includes(zone.tile)) {			
			zones.push(zone.tile)
		}
	}
		
	if (zones.length>0) {
		$.getJSON("/api/future",
				  {
					  zones: zones,
					  data_type: $("#graph-type").val()
				  },
				  function (data,status) {
					  redraw_graph(data,graph_scale);
				  });
	} else {
		$("#graph").html(no_data);
	}
}

function update_lsoa_list() {
    $('#selected-list').empty();
    for (zone of lsoa_zones) {
		$('#selected-list').append($("<li>").html(zone.name));
    }
	update_graph();
}

	
var layer_buffer = [L.layerGroup().addTo(leaflet_map),
					L.layerGroup().addTo(leaflet_map)];
var current_layer_buffer=0;
var other_layer_buffer=1;

var highlight_col = "#ffbc42"
var zone_col = "#42273b"

function update_lsoa() {
    let b = leaflet_map.getBounds();

    $.getJSON("/api/lsoa",
			  {
				  left: b._southWest.lng,
				  bottom: b._southWest.lat,
				  right: b._northEast.lng,
				  top: b._northEast.lat,
				  tolerance: zoom_to_tol(leaflet_map.getZoom())
			  },
			  function(data,status) {
				  L.geoJSON(data, {
					  onEachFeature: function(feature,layer) {

						  if (lsoa_zones_include(feature.properties.name,lsoa_zones)) {
							  layer.setStyle({'color': highlight_col});
							  layer.setStyle({'fillOpacity': 0.5});
						  } else {
							  layer.setStyle({'color': zone_col})
							  layer.setStyle({'fillOpacity': 0.02});
						  }

						  layer.setStyle({'weight': 1});
						  layer.setStyle({'opacity': 1});

						  layer.on('click', function(e) {
 							  if (!lsoa_zones_include(feature.properties.name,lsoa_zones)) {
								  layer.setStyle({'color': highlight_col});
								  layer.setStyle({'fillOpacity': 0.5});
								  lsoa_zones.push({
									  name: feature.properties.name,
									  tile: feature.properties.zone
								  })
							  } else {
								  layer.setStyle({'color': zone_col});
								  lsoa_zones=remove_lsoa_zone(feature.properties.name,lsoa_zones);
								  layer.setStyle({'fillOpacity': 0.02});
							  }
							  update_lsoa_list();
						  });
						  
						  layer.on('mouseover', function(e) {
							  layer.bringToFront();
							  layer.setStyle({'weight': 3});
						  });
						  layer.on('mouseout', function(e) {
							  layer.setStyle({'weight': 1});
						  });
						  
						  //layer.bindPopup(feature.properties.name)
					  }
				  }).addTo(layer_buffer[current_layer_buffer]);
				  
				  leaflet_map.removeLayer(layer_buffer[other_layer_buffer]);
                  layer_buffer[other_layer_buffer].clearLayers();
     			  layer_buffer[current_layer_buffer].addTo(leaflet_map);

				  if (current_layer_buffer==0) {
					  current_layer_buffer=1;
					  other_layer_buffer=0;
				  } else {
					  current_layer_buffer=0;
					  other_layer_buffer=1;
				  }
			  });
}

var no_data = `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .heavy { font: bold 10px sans-serif; }
  </style>
  <text x="100" y="35" class="heavy">No Data</text>
</svg>`

$("#graph-type").on("change",update_graph);
$("#graph").html(no_data);
update_lsoa();




/*
  var popup = L.popup();

function onMapClick(e) {
	console.log(e.latlng);
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(leaflet_map);
}
leaflet_map.on('click', onMapClick);
*/
