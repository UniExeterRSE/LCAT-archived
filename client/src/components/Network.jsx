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
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import Graph from 'react-graph-vis';
import { andify } from '../utils/utils';
import References from './References';
import { NetworkRenderer } from '../core/NetworkRenderer';

import './vis-network.min.css';
import './Network.css';

// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
        console.log("network update");
        props.callback(props.network);
    }, [props.networkParser,
        props.year,
        props.climatePrediction,
        props.sector]);
    return null;
}

function Network(props) {

    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    const [ version, setVersion ] = useState(0);
    const [ graph, setGraph ] = useState({ nodes: [], edges: [] });
    const [ infoTitle, setInfoTitle ] = useState("Click on something for details");
    const [ infoText, setInfoText ] = useState("");
    const [ infoMetadata, setInfoMetadata ] = useState([]);
    const [ nodeedgeId, setNodeedgeId ] = useState(0);
    const [ apiCall, setApiCall ] = useState("node_references");
    const [ buildingGraph, setBuildingGraph] = useState(false);
    const [ networkRenderer, setNetworkRenderer] = useState(new NetworkRenderer);
    const [ networkAPI, setNetworkAPI ] = useState(null);
    const [ sector, setSector ] = useState("All");
    const [ previouslySelected, setPreviouslySelected] = useState(null);
    const [ greyedNodeIDs, setGreyedNodeIDs ] = useState([]);
    
    const handle = useFullScreenHandle();

    const ref = useRef(null);
    
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
        interaction: {
            navigationButtons: true,
            keyboard: true
        },
        autoResize: true,
    };

    
    var events = {
        select: async function(event) {
            if (event.nodes.length>0) {
                // we clicked on a node
                let node = props.networkParser.getNode(event.nodes[0]);
                
                // edit the live node on the network using the ref
                if (previouslySelected!=null) {
                    // clear previous
                    ref.current.nodes.update({
                        id: previouslySelected.node_id,
                        image: await networkRenderer.nodeImageURL(
                            previouslySelected,
                            false,
                            greyedNodeIDs.includes(previouslySelected.node_id))
                    });
                }
                // highlight current
                ref.current.nodes.update({
                    id: node.node_id,
                    image: await networkRenderer.nodeImageURL(node,true,false)
                });
                setPreviouslySelected(node);

                // update the text                
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
                    console.log(event.edges[0]);
                    console.log(props.networkParser.edges);
                    let edge = props.networkParser.getEdge(event.edges[0]);
                    console.log(edge);
                    let node_from = props.networkParser.getNode(edge.node_from);
                    let node_to = props.networkParser.getNode(edge.node_to);
                    let change = " increases ";
                    let title = "Positive correlation";
                    if (edge.type == "-") {
                        change = " decreases ";
                        title = "Negative correlation";
                    }
                    setInfoText("");
                    setInfoTitle(node_from.label+change+node_to.label);
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
                }
            }
        }
    };

    async function updateSector(sector) {
        let updateNodesList = [];
        let updateEdgesList = [];
        let greyedList = [];
        
        for (let node of props.networkParser.nodes) {
            let liveNode = ref.current.nodes.get(node.node_id);
            // not all nodes are rendered so check
            if (liveNode!=null) {
                let grey = sector!="All" && !node.sector.includes(sector);
                
                updateNodesList.push({
                    id: liveNode.id,
                    image: await networkRenderer.nodeImageURL(
                        node,
                        false,
                        grey)
                });;
                let col = "#115158";
                if (grey) {
                    greyedList.push(node.node_id);
                    col = "#eee";
                }
                
                for (let edge of props.networkParser.getEdges(node)) {
                    updateEdgesList.push({
                        id: edge.edge_id,
                        color: { color: col }
                    });                   
                }
            }
        }
        setGreyedNodeIDs(greyedList);
        ref.current.nodes.update(updateNodesList);
        ref.current.edges.update(updateEdgesList);
    }
    
    function handleOnClick() {
        setVersion(version+1);
    }
    
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div className="collapsible">
          <div className="header" {...getToggleProps({onClick: handleOnClick})}>
            {isExpanded ? 'Hide' : 'Show'} details
          </div>
          <div {...getCollapseProps()}>
            <div className="content">
              <p>
                The network below shows how climate change will impact health. You can explore the network by clicking/tapping on the nodes and connections for more information. Nodes can be moved around by dragging them, and the network can also be zoomed and panned. You are currently viewing the impacts for
                
                <select onChange={(e) => updateSector(e.target.value)} >
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
                </select>
               
                in&nbsp;
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>.
              </p>
              <NetworkListener
                network = {props.network}
                networkRenderer = {networkRenderer}
                networkParser = {props.networkParser}
                climatePrediction = {props.climatePrediction}
                year = {props.year}
                sector = {sector}
                callback = {(network) => {
                    setGraph(networkRenderer.buildGraph(
                        props.networkParser,
                        network.nodes,
                        network.edges,
                        sector));
                    if (networkAPI!=null) networkAPI.fit();
                    setVersion(version+1);
                }}
              />
              <FullScreen handle={handle}>
                <div className="network">
                  <div className="network-holder">
                    <Graph
                      ref={ref}
                      key={version}
                      graph={graph}
                      options={options}
                      events={events}
                      getNetwork={ network => setNetworkAPI(network) }
                    />
                  </div>
                  <div className="network-info">
                    <button onClick={() => {
                        if (handle.active) handle.exit();
                        else handle.enter();
                        setVersion(version+1);
                    }}>
                      {handle.active ?
                       <span>Exit fullscreen</span> :
                       <span>Show fullscreen</span>}
                    </button>
                    <h2>{infoTitle}</h2>
                    <p>{infoText}</p>
                    <References
                      id={nodeedgeId}
                      api_call={apiCall}
                    />
                    {/*<p className="metadata">
                      <h3>Metadata</h3>
                      <small>
                        <ul>
                          {infoMetadata.map(el => (<li><b>{el[0]}</b> : {el[1]}</li>))}
                        </ul>
                      </small>
                      </p> */}
                  </div>
                </div>
              </FullScreen>
            </div>            
          </div>
          <p className="note">
            Data source: The impact data is based on published scientific literature and reports. A <a href="https://docs.google.com/spreadsheets/d/1WbTiJGcWOjo6tp5Z_65NDGE8aHLAQ-NPGMotDpDABEo/edit?ouid=102175944541338588070&usp=sheets_home&ths=true" target="_blank">full reference list is available here</a>, and the references relevant to particular impacts can be explored by clicking on the nodes and connections in the network above.
          </p>
          
        </div>
    );
}

export default Network;
