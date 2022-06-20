// -*- mode: rjsx;  -*-
// Copyright (C) 2022 Then Try This
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the Common Good Public License Beta 1.0 as
// published at http://www.cgpl.org
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// Common Good Public License Beta 1.0 for more details.

import React, { Component } from 'react';
import Graph from 'vis-react';
import NetworkLoader from './NetworkLoader';
import { NetworkRenderer } from '../core/NetworkRenderer';

var options = {
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
 
var events = {
    select: function(event) {
        var { nodes, edges } = event;
    }
};

class Network extends React.Component {

    constructor(props) {
        super(props);

        this.networkRenderer = new NetworkRenderer();

        console.log(this.networkRenderer);
        
        this.state={
            graph: {
                nodes: [],
                edges: []
            }
        };
    }
    
    callback = (nodes, edges) => {
        console.log(nodes);
        console.log(edges);

        this.setState(() => ({
            graph: this.networkRenderer.buildGraph(nodes,edges)
        }));        
    }

    render () {
        return (
            <div>
              <NetworkLoader
                id={0}
                callback={this.callback}
              />
              <Graph
                graph={this.state.graph}
                options={options}
                events={events}
                style={{height: 400}}
                getNetwork={this.getNetwork}
                getEdges={this.getEdges}
                getNodes={this.getNodes}
                vis={vis => (this.vis = vis)}
              />
            </div>
        );
    }
}

export default Network;
