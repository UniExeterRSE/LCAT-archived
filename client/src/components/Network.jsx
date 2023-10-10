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
import { useCollapse } from 'react-collapsed';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import Graph from 'react-graph-vis';
import { andify, rcpText, seasonText } from '../utils/utils';
import References from './References';
import { NetworkRenderer } from '../core/NetworkRenderer';
import { getImage } from '../utils/iconLoader';

import './vis-network.min.css';
import './Network.css';

// triggers when the network changes
function NetworkListener(props) {
    useEffect(() => {
        props.callback();
    }, [props.networkParser,
        props.year,
        props.climatePrediction,
        props.sector]);
    return null;
}

function Network(props) {
    function defaultInfo() {
        return {
            title: "Click on something for details",
            text: "",
            explanation: "",
            metadata: []
        };
    }
    
    const [ version, setVersion ] = useState(0);
    const [ graph, setGraph ] = useState({ nodes: [], edges: [] });
    const [ info, setInfo ] = useState(defaultInfo());
    const [ nodeedgeId, setNodeedgeId ] = useState(0);
    const [ apiCall, setApiCall ] = useState("node_references");
    const [ networkRenderer, setNetworkRenderer] = useState(new NetworkRenderer);
    const [ networkAPI, setNetworkAPI ] = useState(null);
    const [ sector, setSector ] = useState("All");
    const [ previouslySelected, setPreviouslySelected] = useState(null);
    const [ greyedNodeIDs, setGreyedNodeIDs ] = useState([]);

    const [ isExpanded, setExpanded ] = useState(true);
    const { getCollapseProps, getToggleProps } = useCollapse({isExpanded});

    const handle = useFullScreenHandle();

    const graphRef = useRef(null);
    const infoRef = useRef(null);    

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
                    graphRef.current.nodes.update({
                        id: previouslySelected.node_id,
                        image: await networkRenderer.nodeImageURL(
                            previouslySelected,
                            false,
                            greyedNodeIDs.includes(previouslySelected.node_id),
                            // presume we are cached by now
                            getImage("icons/"+node.label))
                    });
                }
                // highlight current
                graphRef.current.nodes.update({
                    id: node.node_id,
                    image: await networkRenderer.nodeImageURL(node,true,false,getImage("icons/"+node.label))
                });
                setPreviouslySelected(node);

                // update the text                
                setNodeedgeId(node.node_id);
                setApiCall("node_references");

                // todo: the info should be a component, rather than all this kerfuffle
                let info = defaultInfo();

                let dir = "";
                if (node.state=="decrease") dir = "decreasing";
                if (node.state=="increase") dir = "increasing";
                if (node.state=="uncertain") {
                    info.explanation = "No direction (positive or negative) is displayed for "+node.label+", as the impacts that affect it are mixed.";
                    dir = "mixed impact";
                }
                
                info.title=node.label+" - "+dir;
                info.text=node.description;

                for (let key of Object.keys(node)) {
                    if (!["description", "label", "state"].includes(key)) {
                        if (node[key]!="" && node[key]!=null) {
                            info.metadata.push([key,node[key]]);
                        }
                    }
                }
                setInfo(info);                
            } else {
                if (event.edges.length>0) {
                    // we clicked on an edge

                    // clear selected node
                    if (previouslySelected!=null) {
                        // clear previous
                        graphRef.current.nodes.update({
                            id: previouslySelected.node_id,
                            image: await networkRenderer.nodeImageURL(
                                previouslySelected,
                                false,
                                greyedNodeIDs.includes(previouslySelected.node_id),
                                getImage("icons/"+previouslySelected.label))
                        });
                        setPreviouslySelected(null);
                    }
                    
                    let edge = props.networkParser.getEdge(event.edges[0]);
                    let node_from = props.networkParser.getNode(edge.node_from);
                    let node_to = props.networkParser.getNode(edge.node_to);
                    let change = " increases ";
                    let title = "Positive correlation";
                    if (edge.type == "-") {
                        change = " decreases ";
                        title = "Negative correlation";
                    }
                    info.text="";
                    info.title=node_from.label+change+node_to.label;
                    setApiCall("edge_references");
                    setNodeedgeId(edge.edge_id);

                    for (let key of Object.keys(edge)) {
                        if (!["description", "label", "state"].includes(key)) {
                            if (edge[key]!="" && edge[key]!=null) {
                                info.metadata.push([key,edge[key]]);
                            }
                        }
                    }
                    setInfo(info);
                }
            }
        }
    };

    async function updateSector(sector) {
        let updateNodesList = [];
        let updateEdgesList = [];
        let greyedList = [];

        graphRef.current.Network.unselectAll();
        setInfo(defaultInfo());
        setNodeedgeId(0);
        
        for (let node of props.networkParser.nodes) {
            let liveNode = graphRef.current.nodes.get(node.node_id);
            // not all nodes are rendered so check
            if (liveNode!=null) {
                let grey = sector!="All" && !node.sector.includes(sector);
                
                updateNodesList.push({
                    id: liveNode.id,
                    image: await networkRenderer.nodeImageURL(
                        node,
                        false,
                        grey,
                        getImage("icons/"+node.label))
                });;
                let col = "#115158";
                if (grey) {
                    greyedList.push(node.node_id);
                    col = "#eee";
                }
                
                for (let edge of props.networkParser.getEdges(node)) {
                    let edgecol = col;
                    // if looking at a filtered set and the current one is shown
                    if (sector!="All" && !grey) {
                        // make grey if the other side is filtered too
                        let other = null;
                        if (edge.node_to==node.node_id) {
                            other = props.networkParser.getNode(edge.node_from);
                        } else {
                            other = props.networkParser.getNode(edge.node_to);
                        }
                        if (!other.sector.includes(sector)) {
                            edgecol = "#eee";
                        }                        
                    }
                    
                    updateEdgesList.push({
                        id: edge.edge_id,
                        color: { color: edgecol }
                    });                   
                }
            }
        }
        setGreyedNodeIDs(greyedList);
        graphRef.current.nodes.update(updateNodesList);
        graphRef.current.edges.update(updateEdgesList);
    }

    useEffect(() => setExpanded(false), [props.regions]);

    // reset the scroll position of the info box when the info changes
    useEffect(() => { infoRef.current.scrollTop = 0; }, [info]);

    function handleOnClick() {
        setExpanded(!isExpanded);
        setVersion(version+1);
    }
            
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div className="collapsible">
            <div className="header" {...getToggleProps({onClick: handleOnClick})}>
		{isExpanded ? 'Hide' : 'Explore'} impact details 
            </div>
            <div {...getCollapseProps()}>
		<div className="content"> 
		    <h1>Impact details</h1>
		    <p>
			You can explore the network by clicking/tapping on the nodes and connections for more information. The network can also be zoomed and panned.

			View impacts relevant to&nbsp;
			
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
		    </p>

		    <FullScreen handle={handle}>
			<div className="network">
			    <div className="network-holder">                  
				<NetworkListener
				    networkParser = {props.networkParser}
				    climatePrediction = {props.climatePrediction}
				    year = {props.year}
				    sector = {sector}
				    callback = {() => {
					setGraph(networkRenderer.buildGraph(
					    props.networkParser,
					    sector,
					    async (node, image) => {
						graphRef.current.nodes.update({
						    id: node.node_id,
						    image: await networkRenderer.nodeImageURL(node,false,false,image)
						});
					    }));
					if (networkAPI!=null) networkAPI.fit();                          
					setVersion(version+1);
				    }}
				/>
				<Graph
				    ref={graphRef}
				    key={version}
				    graph={graph}
				    options={options}
				    events={events}
				    getNetwork={ network => setNetworkAPI(network) }
				/>
			    </div>
			    <div ref={infoRef} className="network-info">
				<button className="fullscreen-button" onClick={() => {
					    if (handle.active) handle.exit();
					    else handle.enter();
					    setVersion(version+1);
					}}>
				    {handle.active ?
				     <span>Exit fullscreen</span> :
				     <span>Show fullscreen</span>}
				</button>
				<h2>{info.title}</h2>
				<p>{info.explanation}</p>
				<p>{info.text}</p>
				<References
				    id={nodeedgeId}
				    api_call={apiCall}
				/>
				{/*<div className="metadata">
				   <h3>Metadata</h3>
				   <small>
				   <ul>
				   {info.metadata.map(el => (<li key={el[0]}><b>{el[0]}</b> : {el[1]}</li>))}
				   </ul>
				   </small>
				   </div>*/} 
			    </div> 
			</div>
		    </FullScreen>
		</div>
		
		<p className="note">
		    Data source: The impact data is based on published scientific literature and reports. A <a href="https://static.thentrythis.org/data/climate-data/network/LCAT%20impact%20network%20references%20-%20for%20sharing%20-%20Sheet1.csv" target="_blank">full reference list is available here</a>, and the references relevant to particular impacts can be explored by clicking on the nodes and connections in the network above.
		    The <a href="https://static.thentrythis.org/data/climate-data/network/kumu-lcat-project-lcat-edits.json" target="_blank">full network data (exported from Kumu as JSON) can be downloaded here.</a>
		</p>
            </div>
	</div>
);
}

export default Network;
