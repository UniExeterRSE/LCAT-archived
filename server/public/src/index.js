// Copyright (C) 2021 Then Try This
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const $ = require("jquery")
const L = require("leaflet")
const zones = require("./lsoa.js")
const graph = require("./graph.js")
const network = require("./network.js")
const esri = require("esri-leaflet")
const geojson = require("./geojson.js")

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

var baseMaps = {
    "Terrain": L.tileLayer("http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}),
    "OpenStreetMap": L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}),
    "Toner": L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}),
    "Watercolor":L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'}),
    "Humanitarian": L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {attribution: '©OpenStreetMap contributors. Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France. Website and API terms'}),
    "OS Open Grey": L.tileLayer("https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/os_open_greyscale_no_labels/MapServer/tile/{z}/{x}/{y}.png")

};

//L.control.layers(baseMaps).addTo(leaflet_map);
//L.tileLayer("http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}).addTo(leaflet_map);

esri.basemapLayer("Gray").addTo(leaflet_map);
//esri.basemapLayer('DarkGrayLabels').addTo(leaflet_map);
esri.basemapLayer('ImageryLabels').addTo(leaflet_map);



//esri.basemapLayer("HumanGeography").addTo(leaflet_map);
//esri.basemapLayer('ShadedReliefLabels').addTo(leaflet_map);

async function setup() {
	//const z = new zones.LSOAZones(leaflet_map)
    const test_geojson = new geojson.Geojson(leaflet_map,"uk_cri_grid","",0,15)
	const net = new network.Network()
	
	leaflet_map.on("moveend", () => {
		//z.update(leaflet_map,net);
        test_geojson.update(leaflet_map);
	});

/*	$("#graph-type").on("change",() => {
		graph.update_graph(z.zones,$("#graph-time").val())
	})

	$("#graph-time").on("change",() => {
		console.log($("#graph-time").val());
		graph.update_graph(z.zones,$("#graph-time").val())
	})*/

/*	$("#net-type").on("change", () => {
		net.style=$("#net-type").val()
		net.buildGraph()
	})*/

	for (let t of net.types) {
		$('#'+t).on("change",() => {
			net.buildGraph()
		})
	}

	$("#climate_variables").on("change", () => {
		net.updateVariables($("#climate_variables").val());
	})
	
	$("#graph").html(graph.no_data)

	await net.loadIconCache()

	//z.update(leaflet_map,net)
    test_geojson.update(leaflet_map)
}

setup()
