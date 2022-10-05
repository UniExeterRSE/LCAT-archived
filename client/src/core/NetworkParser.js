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

import { NetworkState } from "./NetworkState.js";

class NetworkParser {

    constructor(nodes,edges) {        
        this.nodes = nodes;
        this.edges = edges.filter(edge => (edge.type=="+" || edge.type=="-"));        
		this.healthNodes = [];
        this.pressureNodes = [];
        this.globalThreshold = 0.0;

        this.visited=[];
        this.adaptationVisited=[];
        
		for (let node of nodes) {
            node.state=new NetworkState("deactivated");
            if (node.type==="Effect" && node.disease_injury_wellbeing!="") {
                this.healthNodes.push(node);
            }
            if (node.type==="Pressure") {
                this.pressureNodes.push(node);
		    }
        }
    }

    // generic functionality
    searchNode(id) {
        let node = this.nodes.find(node => node.node_id===id);
        if (node===undefined) {
            console.log("could not find node: "+id);
            return null;
        } 
        return node;
    }

    getIncomingNodes(node) {
        let ret = [];
        for (let edge of this.edges) {
            if (edge.node_to == node.node_id) {
                ret.push(this.searchNode(edge.node_from));                
            }
        }
        return ret;
    }

    getOutgoingNodes(node) {
        let ret = [];
        for (let edge of this.edges) {            
            if (edge.node_from == node.node_id) {
                ret.push(this.searchNode(edge.node_to));                
            }
        }
        return ret;
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

    // go around and around the graph until we have labelled all nodes
    // and there are no conflicts any more
    recurCalculate(node,state,sector) {        
        // set the supplied state to the node now
        node.state=state;

        // if this is a driver, we don't want to go further
        if (!["Pressure", "Effect", "State", "Exposure"].includes(node.type)) return;

        if (node.node_id=="elem-UvgXeVJE") {
            console.log(node);
        }
        
        for (let edge of this.edges) {
            if (edge.node_from==node.node_id) {
                let child = this.searchNode(edge.node_to);
                // filter on sector 
                if (sector=="all" || sector==child.type) {
                    
                    // make a copy of the parent state
                    let childState = new NetworkState(state.value);

                    childState.apply(edge);
                    
                    // have we visted this one before?
                    let previousState = this.visited[child.node_id];

                    // have we been here before?
                    if (previousState!=undefined) {
                        // if opposing...
                        if (childState.isOppositeTo(previousState)) {
                            /*console.log("XXX "+node.label);
                            console.log("opposed");
                            console.log(child.label);
                            console.log(childState.value+" vs "+previousState.value);
                            */
                            childState.uncertaintyCause=true;
                            childState.set("uncertain");
                            // recur to flip dependant nodes states
                            // to uncertain based on this new state
                            this.visited[child.node_id]=childState;

                            this.recurCalculate(child,childState,"all");
                        } else {
                            // if different but not opposing - redo nodes
                            if (childState.isDifferentTo(previousState)) {
                                this.visited[child.node_id]=new NetworkState(childState.composite(previousState));                                
                                this.recurCalculate(child,new NetworkState(childState.composite(previousState)),"all");

                                // previous incorrect?? version
                                //this.visited[child.node_id]=childState;                                
                                //this.recurCalculate(child,childState,"all");
                            }
                            // agree - no need to redo
                        }
                        
                    } else {
                        this.visited[child.node_id]=childState;
                        // only run the filter on primary impacts (the ones
                        // directly after climate change variables) so set to
                        // "all" when we recurse downward from here
                        this.recurCalculate(child,childState,"all");
                    }
                }
            }        
        }
    }

    // recur upwards from the climate change pressures
    calculate(climatePrediction,year,sector,climateVariableFilter) {
        this.visited=[];
        for (let pressure of this.pressureNodes) {
            if (pressure.label!="Climate change") {
                if (climateVariableFilter == "All" ||
                    climateVariableFilter == pressure.label) {                
                    let prediction = this.getPrediction(climatePrediction,year,pressure.label);
                    if (prediction===false) {
                        this.recurCalculate(pressure,new NetworkState("unknown"),sector);
                    } else {               
                        if (prediction>this.globalThreshold) {
                            this.recurCalculate(pressure,new NetworkState("increase"),sector);
                        } else {
                            if (prediction<-this.globalThreshold) {
                                this.recurCalculate(pressure,new NetworkState("decrease"),sector);
                            } else {                    
                                this.recurCalculate(pressure,new NetworkState("deactivated"),sector);
                            }
                        }
                    }
                }
            }
        }
    }

    // run calculate then return active health impacts for the summary
    calculateHealthWellbeing(climatePrediction,year,sector,climateVariableFilter) {        
        this.calculate(climatePrediction,year,sector,climateVariableFilter);
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
        
    reverseRecurAdaptations(node,adaptations,breadcrumbs) {
        for (let incoming of this.getIncomingNodes(node)) {
            if (incoming.type=="Action") {
                if (adaptations[incoming.node_id]!=undefined) {
                    console.log("adding");
                    adaptations[incoming.node_id].breadcrumbs.push(breadcrumbs);
                } else {
                    console.log("new");
                    adaptations[incoming.node_id]=
                        {action: incoming,
                         breadcrumbs: [breadcrumbs]};
                }
            }
            if (["Pressure", "Effect", "State", "Exposure"].includes(incoming.type) &&
                this.adaptationVisited[incoming.node_id]==undefined) {
                this.adaptationVisited[incoming.node_id]=true;     
                this.reverseRecurAdaptations(
                    incoming,
                    adaptations,
                    [incoming].concat(breadcrumbs));
            }
        }
    }
        
    extractAdaptations() {
        let adaptations = {};
        for (let node of this.healthNodes) {
            if (node.state.value=="increase") {
                this.adaptationVisited=[];

                console.log("searching");
                console.log(node);
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
