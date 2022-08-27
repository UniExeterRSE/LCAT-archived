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

class NetworkState {
    constructor(value) {
        this.validStates = ["deactivated",
                            "uncertain",
                            "increase",
                            "decrease",
                            "nochange",
                            "unknown"];
        this.set(value);
    }

    set(value) {
        if (this.validStates.includes(value)) {
            this.value=value;
        } else {
            console.log("invalid state setting: "+value);
        }
    }

    apply(edge) {
        if (this.value=="unknown") {
            if (edge.type=="-") {
                this.set("decrease");
                return;
            }
            if (edge.type=="+") {
                this.set("increase");
                return;
            }
            this.set("unknown");
            return;
        } else {
                    
            // negative correlation
            if (edge.type=="-") {
                if (this.value==="increase") {
                    this.value="decrease";
                } else {       
                    if (this.value==="decrease") {
                        this.value="increase";
                    }
                }
                // no change if disabled, uncertain etc                
            }
        }
    }

    isOppositeTo = (other) => (
        (this.value==="increase" && other.value==="decrease") ||
        (this.value==="decrease" && other.value==="increase")
    )

    isDifferentTo = (other) => (
        (this.value!=other.value)
    )

    asText() {
        if (this.value==="deactivated") return "Deactivated";
        if (this.value==="uncertain") return "Uncertain";
        if (this.value==="increase") return "Increases";
        if (this.value==="decrease") return "Decreases";
        if (this.value==="unknown") return "Unknown";
        console.log(this.value);
        return "Error";
    }
}

class NetworkParser {

    constructor(nodes,edges) {
        this.nodes = nodes;
        this.edges = edges;        
		this.healthNodes = [];
        this.pressureNodes = [];
        this.globalThreshold = 0.0001;

        this.visited=[];
        
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
    
    searchNode(id) {
        let node = this.nodes.find(node => node.node_id===id);
        if (node===undefined) {
            console.log("could not find node: "+id);
            return null;
        } 
        return node;
    }

    labelToVariable(label) {
        if (label == "Temperature") {
            return "tavg_median";
        }
        return false;
    }
    
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

    recurCalculate(node,state,sector) {
        // set the supplied state to the node now
        node.state=state;

        // if this is a driver, we don't want to go further
        if (node.type=="Driver") return;
        
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
                    if (previousState!=undefined) {
                        // if opposing...
                        if (childState.isOppositeTo(previousState)) {
                            childState.set("uncertain");
                            // recur to flip dependant nodes states
                            // to uncertain based on this new state
                            this.visited[child.node_id]=childState;
                            this.recurCalculate(child,childState,"all");
                        } else {
                            // if different but not opposing - redo nodes
                            if (childState.isDifferentTo(previousState)) {
                                this.visited[child.node_id]=childState;
                                this.recurCalculate(child,childState,"all");
                            }
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

    calculate(climatePrediction,year,sector,climateVariableFilter) {
        this.visited=[];
        for (let pressure of this.pressureNodes) {            
            if (climateVariableFilter == "All" || climateVariableFilter == pressure.label) {                
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

    // run calculate then return active impacts
    calculateHealthWellbeing(climatePrediction,year,sector,climateVariableFilter) {        
        this.calculate(climatePrediction,year,sector,climateVariableFilter);
        let ret = [];
        // only return nodes that are increasing or decreasing
        for (let node of this.healthNodes) {
            if (node.state.value!="deactivated") {
                ret.push(node);
            }
        }
        return ret;
    }

}


export { NetworkParser };
