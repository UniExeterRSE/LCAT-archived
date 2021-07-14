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

function redraw_graph(graph_data) {
	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttributeNS(null, 'width', "100%")
	svg.setAttributeNS(null, 'height', "50%")
	svg.setAttributeNS(null, 'viewBox', '0 0 800 200')

	let add_bar=function(x,y,h) {
		var c = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		c.setAttributeNS(null, 'x', x)
		c.setAttributeNS(null, 'y', y-h)
		c.setAttributeNS(null, 'width', 10)
		c.setAttributeNS(null, 'height', h)
		c.setAttributeNS(null, 'fill', "#f00")
		svg.appendChild(c)
	}

	let x=0
	
	for (let year of graph_data) {
		add_bar(x,200,year.avg*10);
		x+=12;
	}

	$("#graph").empty();
	$("#graph").append(svg);
}

$("#graph-type").on("change",update_graph);

function update_graph() {
	zones = []
	for (let zone of lsoa_zones) {
		if (!zones.includes(zone.tile)) {			
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
					  redraw_graph(data);
				  });
	} else {
		$("#graph").empty();
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
							  layer.setStyle({'color': '#7f7'});
						  } else {
							  layer.setStyle({'color': '#007'})
						  }

						  layer.setStyle({'weight': 1});

						  layer.on('click', function(e) {
 							  if (!lsoa_zones_include(feature.properties.name,lsoa_zones)) {
								  layer.setStyle({'color': '#7f7'});
								  lsoa_zones.push({
									  name: feature.properties.name,
									  tile: feature.properties.zone
								  })
							  } else {
								  layer.setStyle({'color': '#007'});
								  lsoa_zones=remove_lsoa_zone(feature.properties.name,lsoa_zones);
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
