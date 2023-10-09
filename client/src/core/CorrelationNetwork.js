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


class CorrelationNetwork extends Network {

    max_visits = 99;
    override_uncertainties = false;
    vote_to_remove_uncertainties = false;
    
    constructor(nodes,edges) {
        super(nodes,edges);        
        this.clearVotes();        
    }

    clearVotes() {
        // go through the nodes
  		for (let node of this.nodes) {
            // adding empty votes 
            node.votes={};
            if (node.state!="disabled") node.state="uncalculated";
            node.visits=0;
        }
    }

    votes2Hist(votes) {
        let hist = {
            "increase":0,
            "decrease":0,
            "uncertain":0
        };
        
        for (let vote in votes) {
            hist[votes[vote]]+=1;
        }
        
        return hist;
    }
    
    calcState(votes) {
        let hist = this.votes2Hist(votes);

        if (!this.override_uncertainties) {
            // any uncertainty gets passed on
            // not doing this causes instabilities in looped networks
            if (hist['uncertain']>0) return 'uncertain';
        }

        
        if (hist['increase']==0 && hist['decrease']>0) {
            return 'decrease';
        }
        
        if (hist['decrease']==0 && hist['increase']>0) {
            return 'increase';
        }

        if (this.vote_to_remove_uncertainties) {
            if (hist['increase']>hist['decrease']) {
                return 'increase';
            }
            
            if (hist['increase']<hist['decrease']) {
                return 'decrease';
            }
        }

        return 'uncertain';
    }

    votesMixed(votes) {
        let hist = this.votes2Hist(votes);
        return hist['decrease']>0 && hist['increase']>0;
    }
    
    // recur upwards from the climate change pressures
    updateStates(node_id,direction,source_id) {
        let node = this.getNode(node_id);

        // we only process these node types
        if (!["Pressure", "Effect", "State", "Exposure"].includes(node.type)) return;

        if (node.state=="disabled") return;

        // record the vote from this source
        node.votes[source_id]=direction;

        // debug check
        node.visits+=1;
        if (node.visits>this.max_visits) {
            // stuck in a loop flipping
            node.state = "uncertain";
            console.log("LOOP");
            return;
        }
        
        let state = this.calcState(node.votes);
        // no change, stop here
        if (state == node.state) return;

        node.state = state;

        // this function is reentrant - so only refer to node.* from here on        
        for (let edge of this.getOutgoingEdges(node)) {
            let dir = node.state;
            if (state=="increase" || state=="decrease") {
                if (edge.type=="-") {
                    if (dir=="increase") dir="decrease";
                    else dir="increase";
                }
            }
            // for debugging
            edge.state = dir;
            this.updateStates(edge.node_to,dir,node_id);            
        }
    }

    printNode(node) {
        console.log("-------- "+node.label+" ----------");
        let str="";
        for (let s in node.votes) {
            str+=s+":"+node.votes[s]+"\n";
        }
        console.log(node.node_id+"|"+node.state+" = ");
        console.log(str);
    }
    
    print() {
        for (let node of this.nodes) {
            this.printNode(node);
        }
    }
}

function test() {
    let n = new CorrelationNetwork([
        { node_id:"1" },
        { node_id:"2" },
        { node_id:"3" },
        { node_id:"4" },
        { node_id:"5" },
    ],[
        { edge_id:"1", node_from:"1", node_to:"2", type:"+" },
        { edge_id:"2", node_from:"2", node_to:"3", type:"-" },
        { edge_id:"3", node_from:"1", node_to:"3", type:"+" },
        { edge_id:"4", node_from:"1", node_to:"4", type:"+" },
        { edge_id:"5", node_from:"3", node_to:"5", type:"+" },
        { edge_id:"6", node_from:"4", node_to:"1", type:"-" },
    ]); 

    console.log(n.calcState({1:"increase"}));
    console.log(n.calcState({1:"increase",2:"decrease"}));
    console.log(n.calcState({1:"increase",2:"uncertain"}));
    console.log(n.calcState({1:"increase",2:"decrease",3:"decrease"}));
    
    n.updateStates("1","increase","init");    
    //n.print();

    //   1 -> 2 -> 3 -> 4
    //   5 -> 6 ->
        
     n = new CorrelationNetwork([
        { node_id:"1" },
        { node_id:"2" },
        { node_id:"3" },
        { node_id:"4" },
        { node_id:"5" },
        { node_id:"6" },
    ],[
        { edge_id:"1", node_from:"1", node_to:"2", type:"+" },
        { edge_id:"2", node_from:"2", node_to:"3", type:"-" },
        { edge_id:"3", node_from:"3", node_to:"4", type:"+" },
        { edge_id:"4", node_from:"5", node_to:"6", type:"+" },
        { edge_id:"5", node_from:"6", node_to:"3", type:"+" },
    ]); 

    n.updateStates("1","increase","init");    
    n.print();
    n.updateStates("5","decrease","init");    
    n.print();

}

//test();

export { CorrelationNetwork };
