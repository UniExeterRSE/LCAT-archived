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
const vis = require("vis-network/standalone")
//import { Network, DataSet, Node, Edge } from 'vis-network/standalone';

// Cause -> Factor -> Impact -> Factor ->??? Adaptation

class Network {

	constructor() {
		this.net = net.net		
		this.tiles = []
		this.style = "simple"
		this.nodes = []
		this.edges = []
		this.url_cache = {}
	}
	
	nodeImageURL(id,title,text) {
		let height = 400
		if (text=="") height=300
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="`+height+`" style="overflow:visible;">
                   <rect x="0" y="0" width="100%" height="100%" fill="#e6e6e6" stroke-width="5" stroke="#a4b3cd"  rx="15" ></rect>

			<circle
             style="fill:#254747;fill-opacity:1;stroke-width:0.46499997"
             id="circle1093-0-8"
             cx="150"
             cy="125"
             r="100" />

        <foreignObject x="0" y="220" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'nunito',Arial,Helvetica,sans-serif; font-size: 1em; padding: 1em;">
        <center style="font-size: 2em;">`+title+`</center>
        <p>`+text+`</p>
        </div>
        </foreignObject>
        </svg>`

		let url= "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
		return url
	}
	

	factorToNodeFull(factor) {
		return {
			id: factor.id,
			shape: "image",
			label: "",
			size: 25,
			image: this.nodeImageURL(factor.id,factor.short,factor.long),
			preview: false
		}
	}

	factorToNodePreview(factor) {
		return {
 			id: factor.id,
			shape: "text",
			label: factor.short,
			font: { size: 6 },
			preview: true
		}
	}

	factorEdgeFull(factor,impact,new_factor) {
		return {
			from: factor.id,
			to: impact.to,
			arrows: "to",
			label: impact.type,
			//label: new_factor.short,
			//length: 0.5,
			//font: { size: 6 },
			arrowStrikethrough: false,					
			color: { color: "#a4b3cd" }
		}
	}

	factorEdgePreview(factor,impact,new_factor) {
		return {
			from: factor.id,
			to: impact.to,
			arrows: "to",
			label: impact.type,
			//value: 0.05,
			//arrowStrikethrough: false,					
			color: { color: "#a4b3cd" }
		}
	}

	addImpacts(factor,pos) {
		for (let impact_id of factor.impacts) {
			let impact = this.net.impacts[impact_id]
			let new_factor = this.net.factors[impact.to]
			if (new_factor.type!="") {
				this.addFactor(new_factor,false,pos)
				this.edges.add([this.factorEdgePreview(factor,impact,new_factor)])
			} else {
				this.addFactor(new_factor,true,pos)
				this.edges.add([this.factorEdgeFull(factor,impact,new_factor)])
			}
		}
	}

	getRnd(min, max) {
		return (Math.random() * (max - min) ) + min;
	}
	
	addFactor(factor,preview_node,pos) {
		if (!this.nodes.get(factor.id)) {
			if (preview_node==false) {
				let n = this.factorToNodeFull(factor)
				if (pos!=undefined) {
					n.x = pos.x+this.getRnd(-5,5);
					n.y = pos.y+this.getRnd(-5,5);
				}
				console.log(n)
				this.nodes.add([n])
				this.addImpacts(factor)
			} else {
				let n = this.factorToNodePreview(factor)
				if (pos!=undefined) {
					n.x = pos.x+this.getRnd(-5,5);
					n.y = pos.y+this.getRnd(-5,5);
				}
				console.log(n)
				this.nodes.add([n])
			}
		}
	}

	addCause(cause) {
		if (!this.nodes.get(cause.id)) {
			this.nodes.add([{
				id: cause.id,
				shape: "image",
				size: 25,
				image: this.nodeImageURL(cause.id,cause.short,""),
			}])
			this.addFactor(this.net.factors[cause.factor],false)
			let label="+"
			if (cause.operator == "decrease") {
				label="-"
			}

			this.edges.add([{
				from: cause.id,
				to: cause.factor,
				arrows: "to",
				label: label,
				value: 0.05,
				arrowStrikethrough: false,
				color: {
					color: "#ffbc42"
				}
			}])
		}
	}
	
	async buildGraph() {

		this.nodes = new vis.DataSet([])
		this.edges = new vis.DataSet([])
		
/*		this.nodes.add([{
			id: 9999,
			fixed: true
		}])
*/		
		for (let cause of this.net.causes) {
			this.addCause(cause)
//			this.edges.add([{from:9999, to:cause.id}])
		}
		
		const options = {
			physics: {
				enabled: true,
				//solver: "forceAtlas2Based",
				solver: "barnesHut",
				maxVelocity: 1,
				/*barnesHut: {
					//avoidOverlap: 0.5,
					//gravitationalConstant: -10000
				},*/
				//wind: { x: 1, y: 0}
            },
			layout: {
				//improvedLayout:true,
				/*hierarchical: {
					shakeTowards: "roots",
					enabled: false,
					direction: "LR",
					levelSeparation: 200,
				},*/
			},
		};
		
		// create a network
		var container = document.getElementById("network-holder");
		
		var network = new vis.Network(container, {
			nodes: this.nodes,
			edges: this.edges
		}, options);

		network.on( 'click', (properties) => {
			var ids = properties.nodes;
			for (let node of this.nodes.get(ids)) {
				let factor = this.net.factors[node.id]
				let pos=network.getPositions(node.id)[node.id]
				if (node.preview==true) {					
					this.nodes.update(this.factorToNodeFull(factor))
					this.addImpacts(factor,pos)
				}

			}
		});
		
		
	}
}

export { Network }
