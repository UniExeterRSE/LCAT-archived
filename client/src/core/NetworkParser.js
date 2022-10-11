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

// move around the network tagging nodes to indicate their current state,
// starting with a climate prediction (and other variables eventually)

import { Network } from "./Network.js";
import { NetworkState } from "./NetworkState.js";

class NetworkParser extends Network {

    constructor(nodes,edges) {
        super(nodes,edges);
        this.edges = edges.filter(edge => (edge.type=="+" || edge.type=="-"));        
		this.healthNodes = [];
        this.pressureNodes = [];
        this.globalThreshold = 0.0;

        this.visited=[];
        this.adaptationVisited=[];

        // go through the nodes
  		for (let node of nodes) {
            // add a network state to all of them, start off deactivated
            node.state=new NetworkState("deactivated");
            // filter health and pressure nodes into their own lists
            if (node.type==="Effect" && node.disease_injury_wellbeing!="") {
                this.healthNodes.push(node);
            }
            if (node.type==="Pressure") {
                this.pressureNodes.push(node);
		    }
        }
    }

    // does this node connect to a climate variable?
    labelToVariable(label) {
        if (label == "Temperature") {
            return "tavg_median";
        }
        if (label == "Rainfall") {
            return "rain_median";
        }
        return false;
    }

    // pull out the predicted variable at this year
    getPrediction(prediction,year,label) {
        let variable = this.labelToVariable(label);
        if (variable) {
            for (let p of prediction) {
                if (p.year==year) {
                    return p[variable];
                }
            }
        }
        return false;
    }

    // go around the graph until we have labelled all nodes
    // and there are no conflicts any more
    recurCalculate(node,state) {        
        // set the supplied state to the node now
        node.state=state;

        // if this is a driver, we don't want to go further
        if (!["Pressure", "Effect", "State", "Exposure"].includes(node.type)) return;

        // look through the edges
        for (let edge of this.edges) {
            if (edge.node_from==node.node_id) {
                // find the downwards connected node
                let child = this.searchNode(edge.node_to);
                
                // make a copy of the parent state
                let childState = new NetworkState(state.value);
                // calculate our new state based on the edge +/-
                childState.apply(edge);
                
                let previousState = this.visited[child.node_id];

                // we have visited this node before
                if (previousState!=undefined) {
                    // if opposed to last time round...
                    if (childState.isOppositeTo(previousState)) {
                        // we become uncertain
                        childState.uncertaintyCause=true;
                        childState.set("uncertain");
                        // reset visited to new state
                        this.visited[child.node_id]=childState;
                        // recur onwards to update dependant nodes states
                        // to uncertain based on this new state
                        this.recurCalculate(child,childState);
                    } else {
                        // we are different but not opposing - redo nodes
                        if (childState.isDifferentTo(previousState)) {
                            // composite states together and recur further
                            this.visited[child.node_id]=new NetworkState(childState.composite(previousState));                                
                            this.recurCalculate(child,new NetworkState(childState.composite(previousState)));
                        }
                        // we agree with last time, so no need to redo!
                    }
                    
                } else {
                    // first time we've seen this node
                    this.visited[child.node_id]=childState;
                    this.recurCalculate(child,childState);
                }
            }            
        }
    }

    // recur upwards from the climate change pressures
    calculate(climatePrediction,year,climateVariableFilter) {
        this.visited=[];
        for (let pressure of this.pressureNodes) {
            if (pressure.label!="Climate change") {
                if (climateVariableFilter == "All" ||
                    climateVariableFilter == pressure.label) {                
                    let prediction = this.getPrediction(climatePrediction,year,pressure.label);
                    if (prediction===false) {
                        this.recurCalculate(pressure,new NetworkState("unknown"));
                    } else {               
                        if (prediction>this.globalThreshold) {
                            this.recurCalculate(pressure,new NetworkState("increase"));
                        } else {
                            if (prediction<-this.globalThreshold) {
                                this.recurCalculate(pressure,new NetworkState("decrease"));
                            } else {                    
                                this.recurCalculate(pressure,new NetworkState("deactivated"));
                            }
                        }
                    }
                }
            }
        }
    }

    // run calculate then return active health impacts for the summary
    calculateHealthWellbeing(climatePrediction,year,climateVariableFilter) {        
        this.calculate(climatePrediction,year,climateVariableFilter);
        let ret = [];
        // only return nodes that are increasing or decreasing
        for (let node of this.healthNodes) {
            if (node.state.value!="deactivated") {
                // reconstruct the node with the minimun of info
                ret.push({
                    label: node.label,
                    state: node.state.asText()
                });
            }
        }
        return ret;
    }

    // find all adaptations by traversing backwards and adding any effects
    // that connect to any causing impacts towards the climate impact        
    reverseRecurAdaptations(node,adaptations) {
        for (let edge of this.getIncomingEdges(node)) {
            let incoming = this.searchNode(edge.node_from);
            if (incoming.type=="Action") {
                let a = adaptations[incoming.node_id];
                if (a==undefined) {
                    adaptations[incoming.node_id]={
                        action: incoming,
                        parents: [{node: node, edge:edge}]
                    };
                } else {
                    a.parents.push({node: node,edge: edge});
                }
            }
            if (["Pressure", "Effect", "State", "Exposure"].includes(incoming.type) &&
                this.adaptationVisited[incoming.node_id]==undefined) {
                this.adaptationVisited[incoming.node_id]=true;     
                this.reverseRecurAdaptations(incoming,adaptations);
            }
        }
    }

    extractAdaptations() {
        let adaptations = {};
        let pressures = {};
        this.adaptationVisited=[];
        for (let node of this.healthNodes) {
            if (node.state.value=="increase") {
                this.reverseRecurAdaptations(node,adaptations,[node]);
            }
        }

        let ret = [];
        for (let k in adaptations) {
            ret.push(adaptations[k]);
        }        
        console.log(ret);
        return ret;
    }
}


export { NetworkParser };
