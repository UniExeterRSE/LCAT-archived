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
const adapt = require("./adaptation_finder.js")
const dagreD3 = require("dagre-d3")
const d3 = require("d3")

// Create the input graph
var g = new dagreD3.graphlib.Graph({compound:true})
	.setGraph({})
	.setDefaultEdgeLabel(function() { return {}; });

g.graph().rankdir = "LR"

function fetchSvg(url) {
    return new Promise((resolve, reject) => {
		$.get(url, svg => {
			resolve(svg.documentElement)
		})
	})
}

// Cause -> Impact -> Adaptation

async function buildTestGraph() {
	let rain_svg = await fetchSvg("images/rain.svg")
	let wind_svg = await fetchSvg("images/wind.svg")
	let temp_svg = await fetchSvg("images/temp.svg")
	let at_svg = await fetchSvg("images/active-transport.svg")

	g.setNode("a", {label: rain_svg, labelType: 'svg'});
	g.setNode('b', {labelType: 'html', label: '<b>Increased precipitation</b> leads to decreased cycling.'});

 	g.setEdge('a', 'b', { labelType: "html", label: "<span style='color:green'>+</span>"});

	g.nodes().forEach(function(v) {
		var node = g.node(v);
		// Round the corners of the nodes
		node.rx = node.ry = 5;
	});

	// Create the renderer
	var render = new dagreD3.render();

	// Set up an SVG group so that we can translate the final graph.
	var svg = d3.select("#mapsvg"),
		svgGroup = svg.append("g");

	var svg = d3.select("#mapsvg"),
		inner = d3.select("#mapsvg g"),
		zoom = d3.zoom().on("zoom", function() {
			inner.attr("transform", d3.event.transform);
		});
	svg.call(zoom);

	// Run the renderer. This is what draws the final graph.
	render(d3.select("#mapsvg g"), g);

	// Center the graph

    const { width, height } = d3.select("#mapsvg g").node().getBBox()
    console.log([width,height])
    if (width && height) {
		let svgn=d3.select("#mapsvg").node()
		const scale = Math.min(svgn.clientWidth / width, svgn.clientHeight / height) * 0.95
		zoom.scaleTo(svg, scale)
		zoom.translateTo(svg, width / 2, height / 2)
	}
	console.log("network done...")

}

async function buildGraph2() {
	let rain_svg = await fetchSvg("images/rain.svg")
	let wind_svg = await fetchSvg("images/wind.svg")
	let temp_svg = await fetchSvg("images/temp.svg")
	let at_svg = await fetchSvg("images/active-transport.svg")

	g.setNode("a", {label: rain_svg, labelType: 'svg'});
	g.setNode('b', {labelType: 'html', label: '<b>Increased precipitation</b> leads to decreased cycling.'});

	g.setNode("c", {label: wind_svg, labelType: 'svg'});
	g.setNode('d', {labelType: 'html', label: '<b>Increased wind speed</b> leads to decreased cycling. <br>More people use public transport networks.'});
	g.setNode("e", {label: at_svg, labelType: 'svg'});
	g.setNode('f', {label: 'Something else'});
	g.setNode("g", {label: temp_svg, labelType: 'svg'});
	g.setNode('l', {label: 'Adaptation X'});

	g.setNode("x", {label: rain_svg.cloneNode(true), labelType: 'svg'});
	g.setNode('h', {labelType: 'html', label: '<b>Increased wind speed</b> leads to decreased cycling. <br>More people use public transport networks.'});
	g.setNode("y", {label: wind_svg.cloneNode(true), labelType: 'svg'});

	g.setNode("i", {label: at_svg.cloneNode(true), labelType: 'svg'});
	g.setNode('j', {labelType: 'html', label: '<b>Increased wind speed</b> leads to decreased cycling. <br>More people use public transport networks.'});
	g.setNode("k", {label: at_svg.cloneNode(true), labelType: 'svg'});
	
	g.setEdge('a', 'b', { labelType: "html", label: "<span style='color:green'>+</span>"});
	g.setEdge('b', 'e', { labelType: "html", label: "<span style='color:red'>-</span>"});
	g.setEdge('c', 'd', { labelType: "html", label: "<span style='color:green'>+</span>"});
	g.setEdge('d', 'e', { labelType: "html", label: "<span style='color:red'>-</span>"});
	g.setEdge('e', 'f');
	g.setEdge('f', 'g');
	g.setEdge('g', 'f');

	g.setEdge('x', 'h');
	g.setEdge('h', 'i');
	g.setEdge('i', 'f');

	g.setEdge('y', 'j');
	g.setEdge('j', 'k');
	g.setEdge('k', 'f');

	g.setEdge('f', 'l');

	console.log(dagreD3.graphlib.json.write(g))

	
	g.nodes().forEach(function(v) {
		var node = g.node(v);
		// Round the corners of the nodes
		node.rx = node.ry = 5;
	});

	// Create the renderer
	var render = new dagreD3.render();

	// Set up an SVG group so that we can translate the final graph.
	var svg = d3.select("mapsvg"),
		svgGroup = svg.append("g");

	var svg = d3.select("#mapsvg"),
		inner = d3.select("#mapsvg g"),
		zoom = d3.zoom().on("zoom", function() {
			inner.attr("transform", d3.event.transform);
		});
	svg.call(zoom);

	// Run the renderer. This is what draws the final graph.
	render(d3.select("svg g"), g);

	// Center the graph
    const { width, height } = d3.select("svg g").node().getBBox()
    console.log([width,height])
    if (width && height) {
		let svgn=d3.select("#mapsvg").node()
		const scale = Math.min(svgn.clientWidth / width, svgn.clientHeight / height) * 0.95
		zoom.scaleTo(svg, scale)
		zoom.translateTo(svg, width / 2, height / 2)
	}

}

///////////////////

let ad = new adapt.AdaptationFinder(adapt.the_trends)

const load = async () => {
	await ad.loadVariables($("#search-data").val(),
						   [4,5,6],
						   2021,
						   parseInt($("#search-year").val()))
	console.log("loading complete")
	let active = ad.calcActiveTrends()

	console.log(active)
	
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

export { buildTestGraph }
