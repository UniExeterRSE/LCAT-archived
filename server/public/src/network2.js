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
const finder = require("./adaptation_finder.js")
const net = require("./net.js")
const vis = require("vis-network/standalone")

const node_size=25
const preview_font_size=6

class Network {

	constructor() {
		this.net = net.net		
		this.tiles = []
		this.style = "simple"
		this.nodes = []
		this.edges = []
		this.url_cache = {}
		this.finder = new finder.AdaptationFinder()
		this.type_cols = {
			"Equity": "#e6e6e6",
			"Community": "#e6e6e6",
			"Health": "#e6e6e6",
			"Travel": "#e6e6e6",
			"Sustainable-development": "#e6e6e6"
		}
		this.types = ["Health","Equity","Community","Travel","Sustainable-development"]
		this.filter = []
		this.iconCache = {}
		this.iconCacheLoading = false
		this.iconFnFix = {
			"Attractiveness of streets/parks to locals": "Attractiveness of streets parks to locals FILE NAME",
			"Community action to resolve minor anti-social behaviour": "Community action to resolve minor antisocial behaviour",
			"Walk/bike friendly & safe environment": "Walk bike friendly & safe environment FILE NAME",
			"Number of local walking & cycling injuries": "Number of walking & cycling injuries"
		}
		this.notFoundIcon = `<circle
             style="fill:#254747;fill-opacity:1;stroke-width:0.46499997"
             id="circle1093-0-8"
             cx="150"
             cy="125"
             r="100" />`
	}

	async loadIcon(fn) {
		let name = fn
		if (this.iconFnFix[fn]!=null) {
			name=this.iconFnFix[fn]
		}
		let xhr = new XMLHttpRequest();
		await xhr.open("GET","images/icons/"+name+".svg",false);
		xhr.overrideMimeType("image/svg+xml");
		xhr.onload = (e) => {
			if (xhr.responseXML!=null) {
				this.iconCache[fn]=xhr.responseXML.documentElement.innerHTML;
			}
		};
		xhr.onerror = (e) => {
			console.log("problem loading: "+name)
		}
		await xhr.send("");
	}
	
	async loadIconCache() {
		if (!this.iconCacheLoading) {
			this.iconCacheLoading = true
			for (let f in this.net.factors) {
				this.loadIcon(this.net.factors[f].short)
			}
			for (let f in this.net.causes) {
				this.loadIcon(this.net.causes[f].short)
			}
		}
	}

	
	printable(str) {
		return str.replace("&","&amp;");
	}
	
	nodeImageURL(id,title,text,bg) {
		let height = 450
		if (text=="") height=350
		if (bg==undefined) bg="#e6e6e6"
		let icon=this.notFoundIcon
		if (this.iconCache[title]!=null) {
			icon=`<g transform="translate(40,10) scale(7)">` + this.iconCache[title] + `</g>`
		} else {
			console.log("icon for "+title+" not found")
		}
		
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="`+height+`" style="overflow:visible;">
                   <rect x="0" y="0" width="100%" height="100%" fill="`+bg+`" stroke-width="5" stroke="#a4b3cd"  rx="15" ></rect>

        ` + icon + `			

        <foreignObject x="0" y="220" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'nunito',Arial,Helvetica,sans-serif; font-size: 1em; padding: 1em;">
        <center style="font-size: 2em;">`+this.printable(title)+`</center>
        <p>`+this.printable(text)+`</p>
        </div>
        </foreignObject>
        </svg>`

		let url= "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
		return url
	}
	
	adaptationImageURL(id,title,text,bg) {
		let height = 450
		if (text=="") height=350
		if (bg==undefined) bg="#e6e6e6"
		let icon=this.notFoundIcon

		let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="`+height+`" style="overflow:visible;">
                   <rect x="0" y="0" width="100%" height="100%" fill="`+bg+`" stroke-width="5" stroke="#a4b3cd"  rx="15" ></rect>

        ` + icon + `			

        <foreignObject x="0" y="220" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'nunito',Arial,Helvetica,sans-serif; font-size: 1em; padding: 1em;">
        <center style="font-size: 2em;">`+this.printable(title)+`</center>
        <p>`+this.printable(text)+`</p>
        </div>
        </foreignObject>
        </svg>`

		let url= "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
		return url
	}
	

	factorToHTML(factor) {
		let s=""
		s+=`<h3>`+factor.short+`</h3>`
		s+=`<p>`+factor.long+`</p>`
		s+="<ul>"
		if (factor.type!="") {
			s+="<li><b>Type</b>: "+factor.type+"</li>"
		}
		if (factor.unsdg!="") {
			s+="<li><b>UN SDG</b>: "+factor.unsdg+"</li>"
		}
		if (factor.refs.length>0) {
			s+="<li><b>References</b>: <ol>"
			for (let ref of factor.references) {
				s+="<li><a href='"+ref+"'>"+ref+"</a></li>";
			}
			s+="</ol></li>"
		}
		s+="</ul>"
		return s
	}
	
	impactToHTML(impact) {
		let s=""
		if (impact.short!="") {
			s+=`<h3>`+impact.short+`</h3>`
		} else {
			s+=`<b>`+this.net.factors[impact.from].short+`</b> impacts <b>`+this.net.factors[impact.to].short+`</b><br>`
		}
		if (impact.long!="") {
			s+=`<p>`+impact.long+`</p>`
		}
		s+="<ul>"
		if (impact.type!="") {
			s+="<li><b>Type</b>: "+impact.type+"</li>"
		}
		if (impact.unsdg!="") {
			s+="<li><b>UN SDG</b>: "+impact.unsdg+"</li>"
		}
		if (impact.refs.length>0) {
			s+="<li><b>Referencess</b>: <ol>"
			for (let ref of impact.refs) {
				s+="<li><a href='"+ref+"'>"+ref+"</a></li>";
			}
			s+="</ol></li>"
		}
		s+="</ul>"
		return s
	}


	factorToNodeFull(factor) {
		return {
			id: factor.id,
			shape: "image",
			label: "",
			size: node_size,
			// "#e6e6e6"
			image: this.nodeImageURL(
				factor.id,
				factor.short,
				factor.long,
				this.type_cols[factor.type]
			),
			preview: false
		}
	}

	factorToNodePreview(factor) {
		return {
 			id: factor.id,
			shape: "text",
			label: factor.short,
			font: { size: preview_font_size },
			preview: true
		}
	}

	factorEdgeFull(factor,impact,new_factor) {
		let colour = "#ff0000"
		if (impact.type=="+") {
			colour = "#00ff00"
		}
		return {
			id: impact.id,
			from: factor.id,
			to: impact.to,
			arrows: "middle",
			label: impact.type,
			font: {
				color: colour,
				size: 50
			},
			//label: new_factor.short,
			//length: 0.5,
			//font: { size: 6 },
			//arrowStrikethrough: false,					
			color: { color: this.type_cols[factor.type] }
		}
	}

	factorEdgePreview(factor,impact,new_factor) {
		let colour = "#ff0000"
		if (impact.type=="+") {
			colour = "#00ff00"
		}
		return {
			id: impact.id,
			from: factor.id,
			to: impact.to,
			arrows: "to",
			label: impact.type,	
			font: {
				color: colour,
				size: 50
			},
			arrowStrikethrough: false,					
			color: { color: this.type_cols[factor.type] }
		}
	}

	adaptationEdge(factor_id,adaptation) {
		return {
			from: factor_id,
			to: adaptation.id,
			arrows: "to",
			//value: 0.05,
		}
	}

	adaptationToNode(adaptation) {
		return {
			id: adaptation.id,
			shape: "image",
			label: "",
			size: node_size,
			image: this.adaptationImageURL(
				adaptation.id,
				adaptation.short,
				adaptation.long,
				"#ff0000"
			)
		}
	}

	addImpacts(factor,pos) {
		let i=0;
		for (let impact_id of factor.impacts) {
			let impact = this.net.impacts[impact_id]
			let new_factor = this.net.factors[impact.to]

			// get a roughly ok position, downwind and spread out
			let fpos = {
				x: pos.x+100,
				y: pos.y+(i-(factor.impacts.length/2))*node_size
			}
			
			if (new_factor.type=="main element" ||
				this.filter.includes(new_factor.type)) {
				this.addFactor(new_factor,false,fpos)
				this.edges.add([this.factorEdgeFull(factor,impact,new_factor)])
			} else {
				this.addFactor(new_factor,true,fpos)
				this.edges.add([this.factorEdgePreview(factor,impact,new_factor)])
			}
			i+=1;
		}
	}

	getRnd(min, max) {
		return (Math.random() * (max - min) ) + min;
	}
	
	addFactor(factor,preview_node,pos) {
		if (!this.nodes.get(factor.id)) {						
			if (preview_node==false) {
				let n = this.factorToNodeFull(factor)
				n.x = pos.x;
				n.y = pos.y;
				this.nodes.add([n])
				this.addImpacts(factor,{x: n.x, y: n.y})
				this.searchAdaptations(factor.id,pos)
			} else {
				let n = this.factorToNodePreview(factor)
				n.x = pos.x;
				n.y = pos.y;
				this.nodes.add([n])
			}
		}
	}
	
	addCause(cause,y) {
		if (!this.nodes.get(cause.id)) {
			this.nodes.add([{
				id: cause.id,
				shape: "image",
				size: node_size,
				image: this.nodeImageURL(cause.id,cause.short,"","#a4f9c8"),
				x: 0,
				y: y*75,
				fixed: true
			}])
			
			this.addFactor(this.net.factors[cause.factor],false,{x: 100, y: y*75})

			let colour="#00ff00"
			if (cause.type == "-") {
				let colour="#ff0000"
			}

			this.edges.add([{
				from: cause.id,
				to: cause.factor,
				arrows: "to",
				label: cause.type,
				font: {
					color: colour,
					size: 50
				},
				//value: 0.05,
				arrowStrikethrough: false,
				color: {
					color: "#ffbc42"
				}
			}])
		}
	}

	addAdaptation(adaptation,pos) {
		if (!this.nodes.get(adaptation.id)) {						
			let n = this.adaptationToNode(adaptation)
			n.x = pos.x;
			n.y = pos.y;
			this.nodes.add([n])
		}
	}
	
	searchAdaptations(factor_id,pos) {
		for (let aid in this.net.adaptations) {
			let a = this.net.adaptations[aid]
			if (a.related.includes(factor_id)) {
				this.addAdaptation(a,pos)				
				this.edges.add([this.adaptationEdge(factor_id,a)])
			}
		}
	}
	
	async buildGraph() {

		this.nodes = new vis.DataSet([])
		this.edges = new vis.DataSet([])

		// read filter:
		this.filter=[]
		for (var t of this.types) {
			if ($('#'+t).prop('checked')) {
				this.filter.push(t)
			}
		}

		let c = 0
		for (let cause of this.net.causes) {
			console.log(cause)
			if (true || await this.finder.isCauseActive("future_year_avg",this.tiles,2,9,cause)) {
				console.log("cause is active")
				console.log(cause)
				this.addCause(cause,c)
				c+=1
			} else {
				console.log("cause not active")
				console.log(cause)
			}
		}
		
		const options = {
			physics: {
				enabled: true,
				//solver: "forceAtlas2Based",
				solver: "barnesHut",
				maxVelocity: 20,
				barnesHut: {
					//avoidOverlap: 0.5,
					//gravitationalConstant: -10000
				},
				wind: { x: 0.5, y: 0}
            },
			layout: {
				randomSeed: 5,
				improvedLayout: true,
				clusterThreshold: 1,
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
			let ids = properties.nodes;
			let node_selected=false;
			for (let node of this.nodes.get(ids)) {
				let factor = this.net.factors[node.id]
				let pos=network.getPositions(node.id)[node.id]
				if (node.preview==true) {					
					this.nodes.update(this.factorToNodeFull(factor))
					this.addImpacts(factor,pos)
				} else {
					$("#network-info").html(this.factorToHTML(factor))
				}
				node_selected=true;
			}

			if (!node_selected) {
				let ids = properties.edges;
				for (let edge of this.edges.get(ids)) {				
					let impact = this.net.impacts[edge.id]
					if (impact!=undefined) {
						console.log(impact)
						$("#network-info").html(this.impactToHTML(impact))
					}
				}
			}
		});
		
		
	}
}

export { Network }
