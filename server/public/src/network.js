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
const net = require("./net.js")
const dagreD3 = require("dagre-d3")
const d3 = require("d3")

function fetchSvg(url) {
    return new Promise((resolve, reject) => {
		$.get(url, svg => {
			resolve(svg.documentElement)
		})
	})
}

// Cause -> Factor -> Impact -> Factor ->??? Adaptation

class Network {

	constructor() {
		this.net = net.net		
		this.existing_nodes=[]
		this.tiles = []
		this.style = "simple"
		this.render = new dagreD3.render();
	}
	
	addCause(cause) {
		let cause_name = "cause"+cause.id
		if (!this.existing_nodes.includes(cause_name)) {
			this.graph.setNode(cause_name, {
				label: `<div class="net-node-simple">
                          <div class="net-node-simple-vertical-center">
                            <p><img src="`+cause.image+`"><br>                         
			                `+cause.short+`</p>
                          </div>
		                </div>`,
				labelType: 'html'
			});
			this.existing_nodes.push(cause_name)
		}
		return cause
	}

	addFactor(factor) {
		let factor_name = "factor"+factor.id

		if (!this.existing_nodes.includes(factor_name)) {
			if (this.style=="simple") {
				this.graph.setNode(factor_name, {
					label: `<div class="net-node-simple">
                              <div class="net-node-simple-vertical-center">
                                <p><img src="`+factor.image+`"><br> 
                                `+factor.short+`</p>
  		                       </div>
                             </div>`,
					labelType: 'html'
				});
			} else {
				let refs = "<ol>"
				if (factor.references) {
					for (let ref of factor.references) {
						refs+="<li><a href="+ref+">"+ref+"</a></li> "
					}
				}
				refs+="</ol>"
		
				this.graph.setNode(factor_name, {
					label: `<div class="net-node-complex">
                              <div class="net-node-image-holder">
                                 <img src="`+factor.image+`"><br>
                              </div> 
                              <b>`+factor.short+`</b><br>
                              `+factor.long+`<br>
                              `+refs+`
		                     </div>`,
					labelType: 'html'
				});
			}
			this.existing_nodes.push(factor_name)
		}
		return factor
	}

	addImpact(impact) {
		let impact_name = "impact"+impact.id

		if (!this.existing_nodes.includes(impact_name)) {
			if (this.style=="simple") {
				this.graph.setNode(impact_name, {
					label: `<div class="net-node-simple">
                              <div class="net-node-simple-vertical-center">
                                <p><img src="`+impact.image+`"><br> 
                                `+impact.short+`</p>
  		                       </div>
                             </div>`,
					labelType: 'html'
				});
			} else {
				let refs = "<ol>"
				if (impact.refs) {
					for (let ref of impact.refs) {
						refs+="<li><a href="+ref+">"+ref+"</a></li> "
					}
				}
				refs+="</ol>"
		
				this.graph.setNode(impact_name, {
					label: `<div class="net-node-complex">
                              <div class="net-node-image-holder">
                                 <img src="`+impact.image+`"><br>
                              </div> 
                              <b>Impact: `+impact.type+`</b><br>
                              `+impact.long+`<br>
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

	addToCauseToFactor(cause,factor) {
		this.addCause(cause)
		this.addFactor(factor)

		let label="<span style='color:green'>+</span>"
		if (cause.operator == "decrease" ||
			cause.operator == "less-than") {
			label="<span style='color:red'>-</span>"			
		}
		
		this.graph.setEdge("cause"+cause.id, "factor"+factor.id, {
			labelType: "html",
			label: label
		});

		for (let impact_id of factor.impacts) {			
			this.addFactorToImpact(factor,this.net.impacts[impact_id],0)
		}
	}

	addFactorToImpact(factor,impact,depth) {
		if (impact.long!="") {
			this.addImpact(impact)
			this.graph.setEdge("factor"+factor.id,"impact"+impact.id);
		} else {
			let label="<span style='color:green'>+</span>"
			if (impact.type == "-") {
				label="<span style='color:red'>-</span>"			
			}			
			this.graph.setEdge("factor"+factor.id,"factor"+impact.to,{
				labelType: "html",
				label: label
			});
		}

		let next_factor = this.net.factors[impact.to]
		this.addFactor(next_factor)

		if (depth<5) {
			for (let impact_id of next_factor.impacts) {			
				this.addFactorToImpact(next_factor,this.net.impacts[impact_id],depth+1)
			}
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

		this.existing_nodes=[]

		for (let cause of this.net.causes) {			
 			this.addToCauseToFactor(cause,this.net.factors[cause.factor])

			//this.addToImpactToSecondaries(impact_id)
			//	if (this.style=="complex") {
			//		this.addToImpactToAdaptations(impact_id)
			//	}
			//}
		}

		this.graph.nodes().forEach(v => {
			var node = this.graph.node(v);
			// Round the corners of the nodes
			if (node) {
				node.rx = node.ry = 5;
			}
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
