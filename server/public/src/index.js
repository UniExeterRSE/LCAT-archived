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
const adapt = require("./adaptation_finder.js")

/*const dagreD3 = require("dagre-d3")
const d3 = require("d3")
const graphlibDot = require("graphlib-dot")*/

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

var baseMaps = {
	"Terrain": L.tileLayer("http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}),
	"OpenStreetMap": L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}),
    "Toner": L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}),
    "Watercolor":L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'})
};

L.control.layers(baseMaps).addTo(leaflet_map);
L.tileLayer("http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png", {attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'}).addTo(leaflet_map);

const z = new zones.LSOAZones(leaflet_map)

leaflet_map.on("moveend", () => {
	z.update(leaflet_map);
});

$("#graph-type").on("change",() => {
	graph.update_graph(z.zones,$("#graph-time").val())
})

$("#graph-time").on("change",() => {
	console.log($("#graph-time").val());
	graph.update_graph(z.zones,$("#graph-time").val())
})

$("#graph").html(graph.no_data)

z.update(leaflet_map)


let ad = new adapt.AdaptationFinder(adapt.the_trends)

const load = async () => {
	await ad.loadVariables($("#search-data").val(),
						   [4,5,6],
						   2021,
						   parseInt($("#search-year").val()))
	console.log("loading complete")
	let active = ad.calcActiveTrends()
	$("#results").css("display","block")
	$("#results-list").empty();
	for (let t of active) {
		$("#results-list").append($("<h2>").html(t.variable_name+" "+t.operator))		
		$("#results-list").append($("<p>").html("Impacts found for "+t.sector+"/"+t.subsector))		
		let el = $("#results-list").append($("<ul>"))
		for (let impact of t.impacts) {
			let refs = []
			let c = 1
			for (let ref of impact.references) {
				refs.push("<a href='"+ref+"'>REF#"+c+"</a>")
				c+=1
			}
			el.append($("<li>").html("<b>"+impact.type+"</b> "+impact.description+" "+refs.join(", ")))
		}
		$("#results-list").append($("<p>").html("Adaptations"))		
		el = $("#results-list").append($("<ul>"))
		for (let adaptation of t.adaptations) {
			el.append($("<li>").html(adaptation.description))
		}
		
	}}

$("#search").click(() => {
	load()
})

/*
var svg = d3.select("#mapsvg"),
    inner = d3.select("#mapsvg g"),
    zoom = d3.zoom().on("zoom", function() {
	inner.attr("transform", d3.event.transform);
    });
svg.call(zoom);



var render = dagreD3.render();
var g;
function draw() {
    try {
		g = graphlibDot.read(`digraph { 
1 [label="one"]
2 [label="two"]
1 -> 2
}`);
    } catch (e) {
		throw e;
    }
    if (!g.graph().hasOwnProperty("marginx") &&
        !g.graph().hasOwnProperty("marginy")) {
		g.graph().marginx = 20;
		g.graph().marginy = 20;
    }
	
    g.graph().rankdir = "LR";
    
    g.graph().transition = function(selection) {
		return selection.transition().duration(500);
    };
    
    d3.select("#mapsvg g").call(render, g);
	   
    const { width, height } = d3.select("svg g").node().getBBox()
    console.log([width,height])
    if (width && height) {
	let svgn=d3.select("#mapsvg").node()
		const scale = Math.min(svgn.clientWidth / width, svgn.clientHeight / height) * 0.95
		zoom.scaleTo(svg, scale)
		zoom.translateTo(svg, width / 2, height / 2)
    }
}



draw()
*/
