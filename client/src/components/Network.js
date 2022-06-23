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

import React, { Component, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Graph from 'react-graph-vis';
import { NetworkRenderer } from '../core/NetworkRenderer';
import { andify } from '../utils/utils';

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


// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
        props.callback(props.network);
    }, [props.network]);
    return null;
}

class Network extends React.Component {

    constructor(props) {
        super(props);

        this.state={
            version: 0,
            graph: { nodes: [], edges: [] }        
        };
    }

    render () {
        return (
            <div>
              <h1>Health Impacts</h1>
              <p>
                The network below show how climate change will impact health in

                <span className={"projected-regions"}>
                  { andify(this.props.regions.map(e => e.name)) }.
                </span>
                
                you are currently viewing impacts in

                <select>
                  <option value="all">All sectors</option>
                </select>
              </p>
              <NetworkListener
                network = {this.props.network}
                callback = {(network) => {
                    this.setState((state) => ({
                        version: state.version+1, 
                        graph: this.props.networkRenderer.buildGraph(network.nodes,
                                                                     network.edges)
                    }));
                }}
              />
              <Graph
                key={this.state.version}
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
