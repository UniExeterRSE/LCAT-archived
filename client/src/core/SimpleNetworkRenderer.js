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

import { CorrelationNetwork } from './CorrelationNetwork';
//import { CorrelationNetwork } from './CorrelationNetwork';
import { SimpleNetworkParser } from './SimpleNetworkParser';
import { formatTextWrap } from '../utils/utils';
import { loadImage, placeholderIcon, imageLoaded, getImage, textIcon } from '../utils/iconLoader';

const node_size=25;
const preview_font_size=6;

class SimpleNetworkRenderer extends CorrelationNetwork {

	constructor() {
        super([],[]);
		this.iconCacheLoading = false;
        this.nodeColour = {
            "Driver": "#204545",
            "Pressure": "#ff00ff",
            "State": "#3da274",
            "Exposure": "#00ffff",
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

	printable(str) {
		return str.replace("&","&amp;");
	}

    capLength(str) {
        if (str.length>49) {
            return str.substring(0, 49)+"...";
        }
        return str;
    }

    // this function needs tidying up - image management could
    // be better dealt with, but at least currently works with
    // async loading for slow connections etc.
	async nodeImageURL(node,glow,transparent,image) {
        // icons are 117x117 pixels
        let icon_height=117;        
        let image_height = 300;
        let icon_pos = (image_height-icon_height)/2;        
        
        let draw = SVG().size(137, 300);

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

        /*
        // glow
        if (glow) {
            draw.group().svg(await loadImage("glow")).move(-3,icon_pos-10);
        }

        
        if (this.votesMixed(node.votes)) {
            let hist = this.votes2Hist(node.votes);
            let str = hist["increase"]+":"+hist["decrease"]+":"+hist["uncertain"];            
            draw.group().svg(textIcon("#f177f1",str)).move(10,icon_pos);
        } else {           
*/           // draw the icon
        draw.group().svg(image).move(10,icon_pos);

        /*
        }
        
        // no unknown any more...
        if (node.state!="uncalculated" && node.state!="unknown") {
            // draw the direction
            draw.group().svg(await loadImage(node.state)).move(54,60);
        }
        */
		return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(draw.svg());
	}

	getRnd(min, max) {
		return (Math.random() * (max - min) ) + min;
	}
	
///////////////////////////////////////

	async addNode(node,image_callback) {
        // start with a placeholder version
        let image = placeholderIcon(this.nodeColour[node.type]);
        let imageFilename = "icons/"+node.label;
        
        // is it in the cache already?
        if (imageLoaded(imageFilename)) {
            // use it directly
            image = getImage(imageFilename);
        } else {
            // start loading and call callback when it's here
            loadImage(imageFilename).then((image) => {
                image_callback(node,image);
            });
        }
        
        if (node.type=="Pressure") {
        	this.nodes.push({
			    id: node.node_id,
			    shape: "image",
			    image: await this.nodeImageURL(node,false,false,image),
			    size: 30,
				x: -500,
				y: this.nodePositions[node.label],
				fixed: true,
                mDPSEEA: node.type,
                sector: node.sector
		    });
        } else {        
            this.nodes.push({
			    id: node.node_id,
			    shape: "image",
			    image: await this.nodeImageURL(node,false,false,image),
			    size: 30,
                mDPSEEA: node.type,
                sector: node.sector
		    });
        }
	}

	async addFixedNode(node,image_callback) {
        // start with a placeholder version
        let image = placeholderIcon(this.nodeColour[node.type]);
        let imageFilename = "icons/"+node.label;
        
        // is it in the cache already?
        if (imageLoaded(imageFilename)) {
            // use it directly
            image = getImage(imageFilename);
        } else {
            // start loading and call callback when it's here
            loadImage(imageFilename,this.nodeColour[node.type]).then((image) => {
                image_callback(node,image);
            });
        }

        let kumuscale_x = 0.5;
        let kumuscale_y = 1.0;
        
        this.nodes.push({
			id: node.node_id,
			shape: "image",
			image: await this.nodeImageURL(node,false,false,image),
			size: 30,
			x: node.x*kumuscale_x,
			y: node.y*kumuscale_y,
			fixed: true,
            mDPSEEA: node.type,
            sector: node.sector
		});
        
	}

	addEdge(edge) {
        let colour = "#115158" ;
        let highlightColour = "#f5821f";
        if (edge.state=="increase") colour="#afd6e4";
        if (edge.state=="decrease") colour="#f1b9bd";
        if (edge.state=="uncertain") colour="#ff00ff";
        
        let label=edge.type;
        var labelsize = 15;

        let dir="^";
        if (edge.state=="decrease") dir="v";
        if (edge.state=="uncertain") dir="?";
        
        this.edges.push({
			id: edge.edge_id,
			from: edge.node_from,
			to: edge.node_to,
			arrows: "to",
            width: 3,
            //label: dir+" ("+edge.type+")",
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
    
	buildGraph(networkParser, sector, image_callback) {
        this.nodes = [];
		this.edges = [];

		for (let edge of networkParser.edges) {
   			this.addEdge(edge);
		}

		for (let node of networkParser.nodes) {
            if (node.type!="Action") {
   			    this.addFixedNode(node,image_callback);
            }
		}

        return {
            nodes: this.nodes,
            edges: this.edges
        };
	}
}

export { SimpleNetworkRenderer }
