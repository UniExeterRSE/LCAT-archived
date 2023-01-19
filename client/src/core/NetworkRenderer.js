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

import { SVG } from '@svgdotjs/svg.js';
import HealthSvg from '../images/icons/Public health & wellbeing.svg';

// This class takes a network and follows from causes (root nodes with
// no input edges) triggered by climate change through all connected
// effects searching for health ones

// Climate change variables (temp and rain) as input


// [ Temperature rise ] --- Impact 1 --> [ State 

// mDPSEEA (Morris et al., 2006)
// Driver, Pressure, State, Exposure, Effect, Action

import { Network } from './Network';
import { CorrelationNetwork } from './CorrelationNetwork';
import { NetworkParser } from './NetworkParser';
import { formatTextWrap } from '../utils/utils';

const node_size=25;
const preview_font_size=6;

const iconCache = {};

class NetworkRenderer extends Network {

	constructor() {
        super([],[]);
		this.iconCacheLoading = false;
        this.nodeColour = {
            "Driver": "#204545",
            "Pressure": "#204545",
            "State": "#3da274",
            "Exposure": "#3da274",
            "Effect": "#422137",
            "Action": "#422137"
        };
        this.nodePositions = {
            "Temperature": 0,
            "Rainfall": 150,
            "Wind speed": 300,
            "Cloud cover": 450
        };      
	}

    // preload some icons
    loadIcons() {
        this.loadImage("glow");
        this.loadImage("increase");
        this.loadImage("decrease");
        this.loadImage("uncertain");
    }

    notFoundIcon(col,text) {
        return `
<svg width="300" height="600">
<circle
             style="fill:`+col+`;fill-opacity:1;stroke-width:0.46499997"
             id="circle1093-0-8"
             cx="150"
             cy="400"
             r="100" />
 <text x="50%" y="66%" text-anchor="middle" fill="white" font-size="40px" 
font-family="Arial" dy=".3em">`+text+`</text>

</svg>
`;
    }
    
    async loadImage(fn,thunk) {
        if (iconCache[fn]!=undefined) {            
            return iconCache[fn];
        }
        
        let prepend="";
        if (process.env.NODE_ENV==="development") {
            prepend="http://localhost:3000";
        }

        let response = await fetch(prepend+"/images/"+fn+".svg");
        
        if (!response.ok) {
            console.log(`An error has occured loading ${fn}: ${response.status}`);
            return this.notFoundIcon("#f00","ERROR");
        }
        
        let data = await response.text();
        iconCache[fn]=data;
        return iconCache[fn];
    }

	printable(str) {
		return str.replace("&","&amp;");
	}

    capLength(str) {
        if (str.length>49) {
            return str.substring(0, 49)+"...";
        }
        return str;
    }
    
	async nodeImageURL(node,glow,transparent) {
        // icons are 117x117 pixels
        let icon_height=117;        
        let image_height = 300;
        let icon_pos = (image_height-icon_height)/2;        
        
        let draw = SVG()
            .size(137, 300);

        if (transparent) {
            draw.attr('filter','grayscale(1.0) contrast(0.25) brightness(2)');
        }
        
        // draw the text as a foreign object so we don't need to line wrap etc
        let fobj = draw.foreignObject(117,300).move(10,220);
        let el = document.createElement('div');
        el.className='node-title';
        el.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
        el.style.fontFamily="'Montserrat-Medium', Arial, Helvetica, sans-serif";
        el.style.borderRadius="5px";
        el.style.background="white";
        let cel = document.createElement('center');
        cel.innerText = this.capLength(node.label);
        el.appendChild(cel);
        fobj.add(el);

        // glow
        if (glow) {
            draw.group().svg(await this.loadImage("glow")).move(-3,icon_pos-10);
        }
        
        // draw the icon
        draw.group().svg(await this.loadImage("icons/"+node.label))
            .move(10,icon_pos);

        // no unknown any more...
        if (node.state.value!="deactivated" && node.state.value!="unknown") {
            // draw the direction
            draw.group().svg(await this.loadImage(node.state.value)).move(54,60);
        }

		return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(draw.svg());
	}

	getRnd(min, max) {
		return (Math.random() * (max - min) ) + min;
	}
	
///////////////////////////////////////
    
	async addNode(node) {
        if (node.state=="disabled") {
            return;
        }

        if (node.type=="Pressure") {
        	this.nodes.push({
			    id: node.node_id,
			    shape: "image",
			    image: await this.nodeImageURL(node,false,false),
			    size: 30,
				x: -500,
				y: this.nodePositions[node.label],
				fixed: true,
                mDPSEEA: node.type,
                sector: node.sector
		    });

            return;
        }
        
        this.nodes.push({
			id: node.node_id,
			shape: "image",
			image: await this.nodeImageURL(node,false,false),
			size: 30,
            mDPSEEA: node.type,
            sector: node.sector
		});

        return;
	}

	addEdge(edge) {
        let colour = "#115158" ;
        let highlightColour = "#f5821f";
        //if (edge.state=="increase") colour="#afd6e4";
        //if (edge.state=="decrease") colour="#f1b9bd";
        //if (edge.state=="uncertain") colour="#ff00ff";
        
        let label=edge.type;
        var labelsize = 40;

        this.edges.push({
			id: edge.edge_id,
			from: edge.node_from,
			to: edge.node_to,
			arrows: "middle",
            width: 3,
            label: edge.type,
			//labelHighlightBold: false,
			//arrowStrikethrough: false,
            smooth: {
                type: "dynamic",
                enabled: true,
                roundness: 0.5,
            },
			font: {
				color: colour,
				size: labelsize,
				//vadjust: 10,
				//align: "bottom"
			},
			color: {
				color: colour,
				highlight: highlightColour,
			},
            endPointOffset: { to: 1.2 }
		});
	}
    
	buildGraph(networkParser, nodes, edges, sector) {               
        this.nodes = [];
		this.edges = [];

        // do we want a straight copy of the edges, or apply
        // same filtering as below?
		for (let edge of networkParser.edges) {
   			this.addEdge(edge);
		}

        // find causes and propagate upwards (right?) from there
		for (let node of networkParser.nodes) {
            if (["Pressure", "Effect", "State", "Exposure"].includes(node.type) &&
                node.state.value!="deactivated") {
                if (sector!="All" && !node.sector.includes(sector)) {
                    node.transparent=true;
                }
   			    this.addNode(node);
            }
		}

        let g = {
            nodes: this.nodes,
            edges: this.edges
        };

        return g;
		
	}
}

export { NetworkRenderer }
