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

function update_lsoa() {
	let b = leaflet_map.getBounds();
	layer_group.clearLayers();
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

						  layer.setStyle({'color': '#00b'});
						  
						  layer.on('mouseover', function(e) {
							  layer.setStyle({'color': '#f00'})
						  });
						  layer.on('mouseout', function(e) {
							  layer.setStyle({'color': '#00b'})
						  });
						  layer.bindPopup(feature.properties.name)
					  }
				  }).addTo(layer_group);	
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
