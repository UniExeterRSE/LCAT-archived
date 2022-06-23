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
import HealthWellbeing from './HealthWellbeing';
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


function NetworkListener(props) {
    useEffect(() => {
        props.callback(props.network);
    }, [props.network]);
    return null;
}

class Network extends React.Component {

    constructor(props) {
        super(props);

        this.networkRenderer = new NetworkRenderer();

        this.state={
            version: 0,
            graph: {
                nodes: [ { id: 1, label: "wot" } ],
                edges: []
            },
            healthWellbeingNodes: [],
            average: "ann",
            year: 2086
        };
    }

    render () {
        return (
            <div>
              <p>
                Calculate impacts below using 
                <select onChange={(e) => { this.setState(() => ({
                    average: e.target.value                  
                }));}}>
                  <option value="ann">Yearly</option>
                  <option value="djf">Winter</option>
                  <option value="jja">Summer</option>
                </select>

                averages for year 
                
                <select onChange={(e) => { this.setState(() => ({
                    year: e.target.value                  
                }));}}>
                  <option value="1996">1996</option>
                  <option value="2006">2006</option>
                  <option value="2016">2016</option>
                  <option value="2026">2026</option>
                  <option value="2036">2036</option>
                  <option value="2046">2046</option>
                  <option value="2056">2056</option>
                  <option value="2066">2066</option>
                  <option value="2076">2076</option>
                  <option value="2086">2086</option>
                </select>
              </p>

              <NetworkListener
                network = {this.props.network}
                callback = {(network) => {
                    this.setState((state) => ({
                        version: state.version+1, 
                        graph: this.networkRenderer.buildGraph(network.nodes,
                                                               network.edges),
                        healthWellbeingNodes: this.networkRenderer.getHealthWellbeing()
                    }));
                }}
              />
              <HealthWellbeing
                nodes={this.state.healthWellbeingNodes}
              />
              <h1>Impact Network</h1>
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
