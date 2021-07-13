const $ = require("jquery")
const L = require("leaflet")

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(leaflet_map);


function load(offs) {
	$.getJSON("/api/lsoa", {limit: 1, offset: offs}, function(data,status) {
		console.log(data)
		L.geoJSON(data, {
			onEachFeature: function(feature,layer) {
				layer.bindPopup(feature.properties.name);			
			}
		}).addTo(leaflet_map);	
	});
}

load(0);


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
