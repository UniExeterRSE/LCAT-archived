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
import { CorrelationNetwork } from "./CorrelationNetwork.js";
import { NetworkState } from "./NetworkState.js";

class SimpleNetworkParser extends CorrelationNetwork {

    constructor(nodes,edges) {
        super(nodes,edges);
 		this.healthNodes = [];
        this.pressureNodes = [];
    }

    calculate(climatePrediction,year) { }
    
    // run calculate then return active health impacts for the summary
    calculateHealthWellbeing(climatePrediction,year) {        
        this.calculate(climatePrediction,year);
        let ret = [];
        return ret;
    }

    extractAdaptations(sectorFilter) {
        let adaptations = [];

        for (let node of this.nodes) {
            if (node.type=="Action") {
                adaptations.push({
                    action: node,
                    healthnodes: [],
                    parents: []
                });
            }
        }

        return adaptations;
    }


}


export { SimpleNetworkParser };
