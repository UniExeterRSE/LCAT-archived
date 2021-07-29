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

function fetchSvg(url) {
    return new Promise((resolve, reject) => {
		$.get(url, svg => {
			resolve(svg.documentElement)
		})
	})
}

// Cause -> Impact -> Adaptation

class Network {

	constructor() {
		this.ad = new adapt.AdaptationFinder(
			adapt.the_causes,
			adapt.the_impacts,
			adapt.the_adaptations,
			adapt.the_trends
		)

		this.existing_nodes=[]

		// Create the input graph
		this.graph = new dagreD3.graphlib.Graph({compound:true})
			.setGraph({})
			.setDefaultEdgeLabel(function() { return {}; });
		
		this.graph.graph().rankdir = "LR"
	}
	
	async loadData() {
		this.svg_cache = {}
		for (let c of Object.keys(this.ad.causes)) {
			let cause=this.ad.causes[c]
			this.svg_cache[cause.image]=await fetchSvg(cause.image)
		}
	}

	addCause(cause_id) {
		let cause_name = "cause"+cause_id
		let cause = this.ad.causes[cause_id]			
		if (!this.existing_nodes.includes(cause_name)) {
			this.graph.setNode(cause_name, {
				label: this.svg_cache[cause.image],
				labelType: 'svg'
			});
			this.existing_nodes.push(cause_name)
		}
		return cause
	}

	addImpact(impact_id) {
		let impact_name = "impact"+impact_id
		let impact = this.ad.impacts[impact_id]			
		if (!this.existing_nodes.includes(impact_name)) {
			this.graph.setNode(impact_name, {
				label: "<b>"+impact.type+"</b><br>"+impact.description,
				labelType: 'html'
			});
			this.existing_nodes.push(impact_name)
		}
		return impact
	}
	
	addToCauseToImpact(cause_id,impact_id) {
		let cause = this.addCause(cause_id)
		let impact = this.addImpact(impact_id)

		let label="<span style='color:green'>+</span>"
		if (cause.operator == "decrease" ||
			cause.operator == "less-than") {
			label="<span style='color:red'>-</span>"			
		}
		
		this.graph.setEdge("cause"+cause_id, "impact"+impact_id, {
			labelType: "html",
			label: label
		});
	}
	
	async buildGraph(tiles) {
		let active_trends = await this.ad.calcActiveTrends(tiles,2,9)
		this.existing_nodes=[]
				
		for (let trend of active_trends) {
			let cause_id = trend.cause;
			for (let impact_id of trend.impacts) {
				this.addToCauseToImpact(cause_id,impact_id)
			}
		}

		console.log(dagreD3.graphlib.json.write(this.graph))
	
		this.graph.nodes().forEach(v => {
			var node = this.graph.node(v);
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
		render(d3.select("#mapsvg g"), this.graph);
		
		// Center the graph
		const { width, height } = d3.select("#mapsvg g").node().getBBox()
		console.log([width,height])
		if (width && height) {
			let svgn=d3.select("#mapsvg").node()
			const scale = Math.min(svgn.clientWidth / width, svgn.clientHeight / height) * 0.95
			zoom.scaleTo(svg, scale)
			zoom.translateTo(svg, width / 2, height / 2)
		}
		
	}
}

/*
const load = async () => {
	
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
*/

export { Network }
