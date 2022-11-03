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

        // sometimes more is good
        let invertedBenefits = [
            "Cognitive performance & the ability to learn",
            "Wellbeing"
        ];
        
        // go through the nodes
  		for (let node of nodes) {
            // add a network state to all of them, start off deactivated
            node.state=new NetworkState("deactivated");
            // filter health and pressure nodes into their own lists
            if (node.type==="Effect" && node.disease_injury_wellbeing!="") {
                // which way is good?
                if (invertedBenefits.includes(node.label)) {
                    node.invertedBenefit=true;
                } else {
                    node.invertedBenefit=false;
                }
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
            return "tas";
        }
        if (label == "Rainfall") {
            return "pr";
        }
        if (label == "Cloud cover") {
            return "rsds";
        }
        if (label == "Wind speed") {
            return "sfcwind";
        }
        return false;
    }

    // pull out the predicted variable at this year
    getPrediction(prediction,year,label) {
        if (prediction.length>0) {
            let variable = this.labelToVariable(label);
            if (variable) {
                let baseline = parseFloat(prediction[0][variable+"_1980"]);
                let predict = parseFloat(prediction[0][variable+"_"+year]);
                if (variable == "rsds") {
                    // invert radiation to cloud cover
                    return baseline-predict;
                } else {
                    return predict-baseline;
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

        // we only process these node types
        if (!["Pressure", "Effect", "State", "Exposure"].includes(node.type)) return;
        
        // look through the edges and calculate the states for all our child nodes
        for (let edge of this.edges) {
            if (edge.node_from==node.node_id) {                              
                // find the downwards connected node
                let child = this.searchNode(edge.node_to);                
                // make a copy of the parent state
                let childState = new NetworkState(state.value);
                // calculate the child's new state based on the edge +/-
                childState.apply(edge);

                // debugging... show the influence of the parent
                // (after +/- applied) from this edge
                edge.state = childState.value;
                
                let previousState = this.visited[child.node_id];
                
                // we have visited this node before?
                if (previousState!=undefined) {                    
                    // just for debugging purposes
                    if (childState.isOppositeTo(previousState)) {
                        child.uncertaintyCause=true;                    
                    }
                    
                    // returns true if we need to recur because we've changed
                    if (childState.composite(previousState)) {
                        this.visited[child.node_id]=childState;
                        this.recurCalculate(child,childState);
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
    calculate(climatePrediction,year) {
        this.visited=[];
        for (let pressure of this.pressureNodes) {
            if (pressure.label!="Climate change") {
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

    // run calculate then return active health impacts for the summary
    calculateHealthWellbeing(climatePrediction,year) {        
        this.calculate(climatePrediction,year);
        let ret = [];
        // only return nodes that are increasing or decreasing
        for (let node of this.healthNodes) {
            if (node.state.value=="increase" ||
                node.state.value=="decrease") {
                // reconstruct the node with the minimun of info
                ret.push({
                    label: node.label,
                    state: node.state.value
                });
            }
        }
        return ret;
    }

    pushUniqueLabel(node,arr) {
        for (let n of arr) {
            if (n.label==node.label) return;
        }
        arr.push(node);
    }
    
    pushUniqueNodeLabel(node,arr) {
        for (let n of arr) {
            if (n.node.label==node.node.label) return;
        }
        arr.push(node);
    }
    
    // find all adaptations by traversing backwards from a health impact
    // and adding any effects that connect to any causing impacts towards
    // the climate impact        
    reverseRecurAdaptations(healthnode,node,adaptations) {
        for (let edge of this.getIncomingEdges(node)) {
            let incoming = this.searchNode(edge.node_from);
            if (incoming.type=="Action") {
                let a = adaptations[incoming.node_id];
                if (a==undefined) {
                    adaptations[incoming.node_id]={
                        action: incoming,
                        healthnodes: [healthnode],
                        parents: [{node: node, edge:edge}]
                    };
                } else {
                    this.pushUniqueLabel(healthnode,a.healthnodes);
                    this.pushUniqueNodeLabel({node: node,edge: edge},a.parents);
                }
            }
            if (["Pressure", "Effect", "State", "Exposure"].includes(incoming.type) &&
                this.adaptationVisited[incoming.node_id]==undefined) {
                this.adaptationVisited[incoming.node_id]=true;     
                this.reverseRecurAdaptations(healthnode,incoming,adaptations);
            }
        }
    }

    // find all adaptations by traversing backwards from a health impact
    // and adding any effects that connect to any causing impacts towards
    // the climate impact        
    reverseRecurPressures(node,pressures) {
        for (let edge of this.getIncomingEdges(node)) {
            let incoming = this.searchNode(edge.node_from);
            if (incoming.type=="Pressure") {
                this.pushUniqueLabel(node,pressures);                
            }
            if (["Pressure", "Effect", "State", "Exposure"].includes(incoming.type) &&
                this.adaptationVisited[incoming.node_id]==undefined) {
                this.adaptationVisited[incoming.node_id]=true;     
                this.reverseRecurPressures(incoming,pressures);
            }
        }
    }

    extractAdaptations(sectorFilter) {
        let adaptations = {};
        let pressures = {};
        // start with each healtnode
        for (let node of this.healthNodes) {

            // if it's "bad"
            let badDirection="increase";
            if (node.invertedBenefit) {
                badDirection="decrease";
            }
            
            if (node.state.value==badDirection) {
                // search backwards looking for actions that can help with
                // impacts that contribute to this health impact
                this.reverseRecurAdaptations(node,node,adaptations);
                this.adaptationVisited=[];
            }
        }

        // filter the adaptations by sector
        if (sectorFilter!="All") {
            let filteredAdaptations = {};
            // remove ones not in this sector            
            for (let key in adaptations) {
                let a = adaptations[key];
                if (a.action.sector.includes(sectorFilter)) {
                    filteredAdaptations[a.action.node_id]=a;
                }                    
            };
            adaptations=filteredAdaptations;
        }
        
        // while we are here, search for the originating pressures that
        // cause these problems
        let ret = [];
        for (let k in adaptations) {            
            adaptations[k].pressures=[];
            for (let p of adaptations[k].parents) {
                this.reverseRecurPressures(p.node,adaptations[k].pressures);
                this.adaptationVisited=[];
            }
            ret.push(adaptations[k]);
        }

        return ret;
    }
}


export { NetworkParser };
