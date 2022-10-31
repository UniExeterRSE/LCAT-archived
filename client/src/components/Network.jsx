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

import React, { useEffect, useState, useRef } from 'react';
import useCollapse from 'react-collapsed';

import Graph from 'react-graph-vis';
import { andify } from '../utils/utils';
import References from './References';

import './Network.css';

// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
        props.networkRenderer.loadIcons();
        props.callback(props.network);
    }, [props.network,
        props.climatePrediction,
        props.year,
        props.sector,
        props.climateVariableFilter]);
    return null;
}

function Network(props) {

    const [ version, setVersion ] = useState(0);
    const [ graph, setGraph ] = useState({ nodes: [], edges: [] });
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
    const [ infoTitle, setInfoTitle ] = useState("Click on something to see information");
    const [ infoText, setInfoText ] = useState("");
    const [ infoMetadata, setInfoMetadata ] = useState([]);
    const [ climateVariableFilter, setClimateVariableFilter ] = useState("All");
    const [ nodeedgeId, setNodeedgeId ] = useState(0);
    const [ apiCall, setApiCall ] = useState("node_references");

    var options = {
	    physics: {

            stabilization: {
                enabled: true,
                iterations: 500, // maximum number of iteration to stabilize
                updateInterval: 10,
                onlyDynamicEdges: false,
                fit: true
            },
            
            enabled: true,
		    //solver: "forceAtlas2Based",
		    //solver: "repulsion",
		    solver: "barnesHut",
		    //solver: "hierarchicalRepulsion",
		    maxVelocity: 50,
            repulsion: {
                nodeDistance: 40,
                springLength: 10,
                centralGravity: 0,
                //avoidOverlap: 1,
            },
            hierarchicalRepulsion: {
                nodeDistance: 100,
                springLength: 100,
                centralGravity: 0
            },
		    barnesHut: {
			    avoidOverlap: 0.5,
                theta: 0.5,
                springLength: 5,
                centralGravity: 0
		    },
            forceAtlas2Based : {
                avoidOverlap: 0,
                theta: 0.5,
            },
		    wind: { x: 0.5, y: 0} 
        },
	    layout: {
		    randomSeed: 1,
//		    improvedLayout: true,
            clusterThreshold: 1000,
		    hierarchical: {
                sortMethod: "hubsize",
		        shakeTowards: "roots",
		        enabled: false,
		        direction: "RL",
		        levelSeparation: 75,
		    },
	    },
    };
    
    var events = {
        select: function(event) {
            if (event.nodes.length>0) {
                // we clicked on a node
                let node = props.networkRenderer.getParsedNode(event.nodes[0]);
                setNodeedgeId(node.node_id);
                setApiCall("node_references");
                setInfoTitle(node.label);
                setInfoText(node.description);
                let metadata = [];              
                for (let key of Object.keys(node)) {
                    if (!["description", "label", "state"].includes(key)) {
                        if (node[key]!="" && node[key]!=null) {
                            metadata.push([key,node[key]]);
                        }
                    }
                }
                setInfoMetadata(metadata);
            } else {
                if (event.edges.length>0) {
                    // we clicked on an edge                
                    let edge = props.networkRenderer.getParsedEdge(event.edges[0]);
                    
                    let node_from = props.networkRenderer.getParsedNode(edge.node_from);
                    let node_to = props.networkRenderer.getParsedNode(edge.node_to);
                    let change = " increases ";
                    let title = "Positive correlation";
                    if (edge.type == "-") {
                        change = " decreases ";
                        title = "Negative correlation";
                    }
                    setInfoText(node_from.label+change+node_to.label);
                    setInfoTitle(title);
                    setApiCall("edge_references");
                    setNodeedgeId(edge.edge_id);

                    let metadata = [];              
                    for (let key of Object.keys(edge)) {
                        if (!["description", "label", "state"].includes(key)) {
                            if (edge[key]!="" && edge[key]!=null) {
                                metadata.push([key,edge[key]]);
                            }
                        }
                    }
                    setInfoMetadata(metadata);
                    
                    /*setInfoMetadata([["Evidence paper 1", "Info & link"],
                                     ["Evidence paper 2", "Info & link"],
                                     ["Evidence paper 3", "Info & link"]]);*/
                }
            }
        }
    };

    function handleOnClick() {
        setVersion(version+1);
    }
    
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div className="collapsible">
          <div className="header" {...getToggleProps({onClick: handleOnClick})}>
            {isExpanded ? 'Hide' : 'Show'} more
          </div>
          <div {...getCollapseProps()}>
            <div className="content">
              <p>
                The network below shows how climate change will impact health. You can explore the network by clicking/tapping on the nodes and connections for more information. Nodes can be moved around by dragging them, and the network can also be zoomed and panned. You are currently viewing the impacts for

                <select>
                  <option value="All">All sectors</option>
                  <option disabled value="Health & Social Care">Health & Social Care</option>
                  <option disabled value="Biodiversity & Natural Habitats">Biodiversity & Natural Habitats</option>
                  <option disabled value="Water Supply & Quality">Water Supply & Quality</option>
                  <option disabled value="Education Services">Education Services</option>
                  <option disabled value="Transport">Transport</option>
                  <option disabled value="Energy Supply & Demand">Energy Supply & Demand</option>
                  <option disabled value="Business & Industry">Business & Industry</option>
                  <option disabled value="Information & Communication Technology">Information & Communication Technology</option>
                  <option disabled value="International Factors">International Factors</option>                  
                </select>
               
                in&nbsp;
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>.
              </p>
              <NetworkListener
                network = {props.network}
                networkRenderer = {props.networkRenderer}
                climatePrediction = {props.climatePrediction}
                year = {props.year}
                sector = {props.sector}
                climateVariableFilter = {climateVariableFilter}
                callback = {(network) => {
                    setVersion(version+1);
                    setGraph(props.networkRenderer.buildGraph(network.nodes,
                                                              network.edges,
                                                              props.climatePrediction,
                                                              props.year,
                                                              props.sector,
                                                              climateVariableFilter));
                }}
              />
              <div className="network">
                <div className="network-holder">
                  <Graph
                    key={version}
                    graph={graph}
                    options={options}
                    events={events}
                  />
                </div>
                <div className="network-info">
                  <h2>{infoTitle}</h2>
                  <p>{infoText}</p>
                  <References
                    id={nodeedgeId}
                    api_call={apiCall}
                  />
                  <p className="metadata">
                    <h3>Metadata</h3>
                    <small>
                      <ul>
                        {infoMetadata.map(el => (<li><b>{el[0]}</b> : {el[1]}</li>))}
                      </ul>
                    </small>
                  </p>
                </div>
              </div>
            </div>            
          </div>
          <p className="note">
            Data source: The impact data is based on published scientific literature and reports. A full reference list is available here, and the references relevant to particular impacts can be explored by clicking on the nodes and connections in the network above.
          </p>
          
        </div>
    );
}

export default Network;
