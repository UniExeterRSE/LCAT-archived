const $ = require("jquery")
const L = require("leaflet")

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(leaflet_map);

var layer_group = L.layerGroup().addTo(leaflet_map);

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

var selected_lsoa_zones = []

function update_lsoa_list() {
    $('#selected-list').empty();
    for (name of selected_lsoa_zones) {
	$('#selected-list').append($("<li>").html(name));
    }			 
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

 			  if (selected_lsoa_zones.includes(feature.properties.name)) {
			      layer.setStyle({'color': '#7f7'});
			  } else {
			      layer.setStyle({'color': '#007'})
			  }

			  layer.setStyle({'weight': 1});

			  layer.on('click', function(e) {
 			      if (!selected_lsoa_zones.includes(feature.properties.name)) {
				  layer.setStyle({'color': '#7f7'});
				  selected_lsoa_zones.push(feature.properties.name)
			      } else {
				  layer.setStyle({'color': '#007'});
				  const index = selected_lsoa_zones.indexOf(feature.properties.name);
				  if (index > -1) {
				      selected_lsoa_zones.splice(index, 1);
				  }								  
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
