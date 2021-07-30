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
		this.tiles = []
		this.style = "simple"
		this.render = new dagreD3.render();
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
				label: `<div class="net-node-simple">
                          <div class="net-node-simple-vertical-center">
                            <p><img src="`+cause.image+`"><br>                         
			                `+cause.description+`</p>
                          </div>
		                </div>`,
				labelType: 'html'
			});
			this.existing_nodes.push(cause_name)
		}
		return cause
	}

	addImpact(impact_id) {
		let impact_name = "impact"+impact_id
		let impact = this.ad.impacts[impact_id]			

		if (!this.existing_nodes.includes(impact_name)) {
			if (this.style=="simple") {
				this.graph.setNode(impact_name, {
					label: `<div class="net-node-simple">
                              <div class="net-node-simple-vertical-center">
                                <p><img src="`+impact.image+`"><br> 
                                `+impact.short_description+`</p>
  		                       </div>
                             </div>`,
					labelType: 'html'
				});
			} else {
				let refs = "<ol>"		
				for (let ref of impact.references) {
					refs+="<li><a href="+ref+">"+ref+"</a></li> "
				}
				refs+="</ol>"
		
				this.graph.setNode(impact_name, {
					label: `<div class="net-node-complex">
                              <div class="net-node-image-holder">
                                 <img src="`+impact.image+`"><br>
                              </div> 
                              <b>Impact: `+impact.type+`</b><br>
                              `+impact.description+`<br>
                              `+refs+`
		                     </div>`,
					labelType: 'html'
				});
			}
			this.existing_nodes.push(impact_name)
		}
		return impact
	}

	addAdaptation(adapt_id) {
		let adapt_name = "adapt"+adapt_id
		let adapt = this.ad.adaptations[adapt_id]			
		if (!this.existing_nodes.includes(adapt_name)) {
			if (this.style=="simple") {
				this.graph.setNode(adapt_name, {
					label: adapt.short_description,
					labelType: 'html'
				});
			} else {
				// add the examples
				let exs=""
				if (adapt.examples.length>0) {
					exs+="<br><ol>"
					for (let example of adapt.examples) {				
						exs+="<li>"+example+"</li>"
					}
					exs+="</ol>"
				}

				this.graph.setNode(adapt_name, {
					label: `<b>Adaptation</b><br>`+adapt.description+exs,
					labelType: 'html'
				});
			}
			this.existing_nodes.push(adapt_name)

		}
		return adapt
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

	addToImpactToSecondaries(impact_id) {
		let impact = this.addImpact(impact_id)
		for (let secondary_id of impact.secondary_impacts) {		
			let secondary = this.addImpact(secondary_id)			
			this.graph.setEdge("impact"+impact_id, "impact"+secondary_id);
		}
	}

	addToImpactToAdaptations(impact_id) {
		let impact = this.addImpact(impact_id)
		for (let adapt_id of impact.adaptations) {
			let adaptation = this.addAdaptation(adapt_id)		
			this.graph.setEdge("impact"+impact_id,"adapt"+adapt_id)
		}
	}
	
	async buildGraph() {
		// rebuild the lot
		$("#mapsvg g").empty();

		let svg = d3.select("#mapsvg")

		this.graph = new dagreD3.graphlib.Graph({compound:true})
			.setGraph({})
			.setDefaultEdgeLabel(function() { return {}; });
		
		this.graph.graph().rankdir = "LR"		
		this.graph.graph().ranker = "longest-path"

		let active_trends = await this.ad.calcActiveTrends(this.tiles,2,9)
		this.existing_nodes=[]

		for (let trend of active_trends) {
			let cause_id = trend.cause;
			for (let impact_id of trend.impacts) {
 				this.addToCauseToImpact(cause_id,impact_id)
				this.addToImpactToSecondaries(impact_id)
				if (this.style=="complex") {
					this.addToImpactToAdaptations(impact_id)
				}
			}
		}

		this.graph.nodes().forEach(v => {
			var node = this.graph.node(v);
			// Round the corners of the nodes
			node.rx = node.ry = 5;
		});
		


		let inner = d3.select("#mapsvg g")
		this.zoom = d3.zoom().on("zoom", function() {
			inner.attr("transform", d3.event.transform);
		});
		svg.call(this.zoom);
		svg.call(this.zoom.transform,d3.zoomIdentity)

		// Run the renderer. This is what draws the final graph.
		this.render(d3.select("#mapsvg g"), this.graph);
		
		// Center the graph
		const { width, height } = d3.select("#mapsvg g").node().getBBox()
		console.log([width,height])
		if (width && height) {
			let svgn=d3.select("#mapsvg").node()
			const scale = Math.min(svgn.clientWidth / width, svgn.clientHeight / height) * 0.95
			svg.call(this.zoom.transform,d3.zoomIdentity)
			this.zoom.scaleTo(svg, scale)
			this.zoom.translateTo(svg, width / 2, height / 2)
		}
		
	}
}

export { Network }
