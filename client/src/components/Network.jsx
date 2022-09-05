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

import './Network.css';

// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
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
    const [ sectorFilter, setSectorFilter ] = useState("All");

    const networkReference = useRef(null);

    useEffect(() => {
        if (networkReference.current!=null) {
            networkReference.current.cluster({
                joinCondition: function (childOptions) {
                    if (childOptions.sector!=undefined) {
                        return childOptions.sector.includes(sectorFilter);
                    }
                    return false;
                },
                clusterNodeProperties: {
                    id: "cidCluster",
                    borderWidth: 3,
                    shape: "database",
                },
            });
        }
        //setVersion(version+1);
    }, [sectorFilter]);
    
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

                setInfoTitle(node.label);
                setInfoText(node.description);
                let metadata = [];
                /*
                for (let key of Object.keys(node)) {
                    if (!["description", "label", "state"].includes(key)) {
                        if (node[key]!="" && node[key]!=null) {
                            metadata.push([key,node[key]]);
                        }
                    }
                }*/
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
                    setInfoMetadata([["Evidence paper 1", "Info & link"],
                                     ["Evidence paper 2", "Info & link"],
                                     ["Evidence paper 3", "Info & link"]]);                
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
                The network below shows how 

                <select onChange={(e) => { setClimateVariableFilter(e.target.value); }}>
                  <option value="All">All climate change</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Wind speed">Wind speed</option>
                  <option value="Rainfall">Rainfall</option>
                  <option value="Cloud cover">Cloud cover</option>
                </select>

                will impact

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

                
                {/*<select onChange={(e) => { setSectorFilter(e.target.value); }}>
                  <option value="All">All sectors</option>
                  <option value="Health & Social Care">Health & Social Care</option>
                  <option value="Biodiversity & Natural Habitats">Biodiversity & Natural Habitats</option>
                  <option value="Water Supply & Quality">Water Supply & Quality</option>
                  <option value="Education Services">Education Services</option>
                  <option value="Transport">Transport</option>
                  <option value="Energy Supply & Demand">Energy Supply & Demand</option>
                  <option value="Business & Industry">Business & Industry</option>
                  <option value="Information & Communication Technology">Information & Communication Technology</option>
                  <option value="International Factors">International Factors</option>                  
                  </select>*/}

                in&nbsp;
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>.
              </p>
              <NetworkListener
                network = {props.network}
                climatePrediction = {props.climatePrediction}
                year = {props.year}
                sector = {props.sector}
                climateVariableFilter = {climateVariableFilter}
                sectorFilter = {sectorFilter}
                callback = {(network) => {
                    setVersion(version+1);
                    setGraph(props.networkRenderer.buildGraph(network.nodes,
                                                              network.edges,
                                                              props.climatePrediction,
                                                              props.year,
                                                              props.sector,
                                                              climateVariableFilter,
                                                              sectorFilter));
                }}
              />
              <div className="network">
                <div className="network-holder">
                  <Graph
                    key={version}
                    graph={graph}
                    options={options}
                    events={events}
                    //style={{height: 600, width: 800}}
                    //getNetwork={() => graph}
                    //getEdges={() => graph.edges}
                    //getNodes={() => graph.nodes}
                    //vis={vis => (this.vis = vis)}
                    getNetwork={network => (networkReference.current = network)}
                  />
                </div>
                <div className="network-info">
                  <h2>{infoTitle}</h2>
                  <p>{infoText}</p>
                  <ul>
                    {infoMetadata.map(el => (<li><b>{el[0]}</b> : {el[1]}</li>))}
                  </ul>                   
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}

export default Network;
