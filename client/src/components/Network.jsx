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

import React, { useEffect, useState } from 'react';
import useCollapse from 'react-collapsed';

import Graph from 'react-graph-vis';
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
        //var { nodes, edges } = event;
    }
};


// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
        props.callback(props.network);
    }, [props.network,
        props.climatePrediction,
        props.year,
        props.sector]);
    return null;
}

function Network(props) {

    const [ version, setVersion ] = useState(0);
    const [ graph, setGraph ] = useState({ nodes: [], edges: [] });
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div className="collapsible">
          <div className="header" {...getToggleProps()}>
            {isExpanded ? 'Hide' : 'Show'} Health impact details
          </div>
          <div {...getCollapseProps()}>
            <div className="content">
              <p>
                The network below <span className={"nonsense"}>(with nonsense test data)</span> shows how climate change will impact health in

                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>.
              </p>
              <NetworkListener
                network = {props.network}
                climatePrediction = {props.climatePrediction}
                year = {props.year}
                sector = {props.sector}
                callback = {(network) => {
                    setVersion(version+1);
                    setGraph(props.networkRenderer.buildGraph(network.nodes,
                                                              network.edges,
                                                              props.climatePrediction,
                                                              props.year,
                                                              props.sector));
                }}
              />
              <Graph
                key={version}
                graph={graph}
                options={options}
                events={events}
                style={{height: 800}}
                getNetwork={() => graph}
                getEdges={() => graph.edges}
                getNodes={() => graph.nodes}
                vis={vis => (this.vis = vis)}
              />
            </div>
          </div>
        </div>
    );
}

export default Network;
