// -*- mode: rjsx;  -*-
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

import { AdaptationFinder } from './AdaptationFinder'
import HealthSvg from '../images/icons/Public health & wellbeing.svg';

// This class takes a network and follows from causes (root nodes with
// no input edges) triggered by climate change through all connected
// effects searching for health ones

// Climate change variables (temp and rain) as input


// [ Temperature rise ] --- Impact 1 --> [ State 

// mDPSEEA (Morris et al., 2006)
// Driver, Pressure, State, Exposure, Effect, Action

import { NetworkParser } from './NetworkParser';

const node_size=25;
const preview_font_size=6;

class NetworkRenderer {

	constructor() {
		this.nodes = [];
		this.edges = [];        
        this.healthNodes = [];
        this.causeNodes = [];
		this.iconCache = {};
		this.iconCacheLoading = false;
		this.notFoundIcon = `<circle
             style="fill:#254747;fill-opacity:1;stroke-width:0.46499997"
             id="circle1093-0-8"
             cx="150"
             cy="230"
             r="100" />`;
	}
    
    loadIcons() {
    }
    
	async loadIcon(fn) {
		let name = fn;
		let xhr = new XMLHttpRequest();
        console.log("loading: "+name);
		await xhr.open("GET","images/icons/"+name+".svg",false);
		xhr.overrideMimeType("image/svg+xml");
		xhr.onload = (e) => {
			if (xhr.responseXML!=null) {
                console.log("loaded: "+name);
				this.iconCache[fn]=xhr.responseXML.documentElement.innerHTML;
			}
		};
		xhr.onerror = (e) => {
			console.log("problem loading: "+name);
		};
		await xhr.send("");
	}
	
	async loadIconCache() {
		if (!this.iconCacheLoading) {
			this.iconCacheLoading = true;
			for (let f in this.net.factors) {
				this.loadIcon(this.net.factors[f].short);
			}
			for (let f in this.net.causes) {
				this.loadIcon(this.net.causes[f].short);
			}
			this.loadIcon("glow");
		}
	}
    
	printable(str) {
		return str.replace("&","&amp;");
	}
	
	nodeImageURL(id,title,text,bg,show_glow) {
		let height = 500;
		if (bg==undefined) bg="#e6e6e6";
		let icon=this.notFoundIcon;
		let glow="";
		if (show_glow) {
			glow=`<g transform="translate(0,95) scale(7.8)">` + this.iconCache["glow"] + `</g>`;
		}
		if (this.iconCache[title]!=null) {
			icon=`<g transform="translate(40,130) scale(7)">` + this.iconCache[title] + `</g>`;
		} else {
			//console.log("icon for "+title+" not found");
		}

		let extra = "";
		if (text!="") {
			extra = `<center style="font-size: 1.5em;">`+text+`</center>`;
		}
		
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="`+height+`" style="overflow:visible;">`
		    + glow + icon + 
            `<foreignObject x="0" y="340" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'nunito',Arial,Helvetica,sans-serif; font-size: 1em; padding: 1em;">
        <center style="font-size: 2em;">`+this.printable(title)+`</center>
		<center style="font-size: 2em;">`+ extra +`</center>
        </div>
        </foreignObject>
        </svg>`;

		let url= "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
		return url;
	}



	getRnd(min, max) {
		return (Math.random() * (max - min) ) + min;
	}
	
///////////////////////////////////////
    
	addNode(node,y) {
        if (node.state=="disabled") {
            return;
        }

        let change = node.state.asText();

        if (node.type=="health-wellbeing") {
            this.healthNodes.push(node);
        }
        if (node.type=="climate") {
            this.causeNodes.push(node);
        	this.nodes.push({
			    id: node.node_id,
			    shape: "image",
			    image: this.nodeImageURL(node.id,node.title,change,"#a4f9c8",false),
			    size: 30,
				x: 0,
				y: this.fixedYPos*75,
				fixed: true,
		    });
            this.fixedYPos+=1;
        } else {
        	this.nodes.push({
			    id: node.node_id,
			    shape: "image",
			    image: this.nodeImageURL(node.id,node.title,change,"#a4f9c8",false),
			    size: 30
		    });
        }
	}

	addEdge(edge,y) {
		let colour = "#b0cacc";
        let label="-";
        if (edge.direction=="0") {
            label="+";
        }

        var labelsize = 15;
        
        if (edge.description!=null && edge.description!="") {
            label=edge.description+" ("+label+")";
            labelsize = 5;
        }
        
        this.edges.push({
			id: edge.edge_id,
			from: edge.node_from,
			to: edge.node_to,
			arrows: "to",
            label: label,
			labelHighlightBold: false,
			arrowStrikethrough: false,
			font: {
				color: colour,
				size: labelsize,
				//vadjust: 10,
				//align: "bottom"
			},
			color: {
				color: colour,
				highlight: colour,
			}
		});
	}
    
	buildGraph(nodes, edges, climatePrediction, year, sector) {               
        let networkParser = new NetworkParser(nodes,edges);
        //console.log([climatePrediction, year]);
        networkParser.calculate(climatePrediction,year,sector);
        nodes = networkParser.nodes;
		edges = networkParser.edges;

        this.nodes = [];
		this.edges = [];
		this.healthNodes = [];
        this.causeNodes = [];
        this.fixedYPos=0;
        
		let c = 0;
        // find causes and propagate upwards (right?) from there
		for (let node of nodes) {
            if (node.state.value!="deactivated") {
   			    this.addNode(node,c);
			    c+=1;
            }
		}

		for (let edge of edges) {
   			this.addEdge(edge,c);
		}

        let g = {
            nodes: this.nodes,
            edges: this.edges
        };

        return g;
		
/*		network.on('click', (properties) => {
			let ids = properties.nodes;
			let node_selected=false;
			for (let node of this.nodes.get(ids)) {
				let factor = this.net.factors[node.id]
				let pos=network.getPositions(node.id)[node.id]

				if (factor!=undefined) {
					if (node.preview==true) {					
						this.nodes.update(this.factorToNodeFull(factor))
						this.addImpacts(factor,pos)
						$("#network-info").html(this.factorToHTML(factor))
					} else {
						$("#network-info").html(this.factorToHTML(factor))
					}
					node_selected=true;
				} else {
					for (let c of this.net.causes) {
						if (c.id==node.id) {
							$("#network-info").html(this.causeToHTML(c))
						}
					}
				}
			}

			if (!node_selected) {
				let ids = properties.edges;
				for (let edge of this.edges.get(ids)) {				
					let impact = this.net.impacts[edge.id]
					if (impact!=undefined) {
						$("#network-info").html(this.impactToHTML(impact))
					} else {
						for (let c of this.net.causes) {
							if (c.id==edge.id) {
								$("#network-info").html(this.causeToHTML(c))
							}
						}
					}
				}
			}
		});
        */
		
		
	}
}

export { NetworkRenderer }
