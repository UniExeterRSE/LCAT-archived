// -*- mode: rjsx;  -*-
// Development before 2024 Copyright (C) Then Try This and University of Exeter
// Development from 2024 Copyright (C) University of Exeter
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

class Network {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    getNode(id) {
        for (let node of this.nodes) {
            if (node.node_id === id) return node;
        }
        return false;
    }

    getEdge(id) {
        for (let edge of this.edges) {
            if (edge.edge_id == id) return edge;
        }
        return false;
    }

    // generic functionality
    searchNode(id) {
        let node = this.nodes.find((node) => node.node_id === id);
        if (node === undefined) {
            console.log("could not find node: " + id);
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

    getIncomingEdges(node) {
        let ret = [];
        for (let edge of this.edges) {
            if (edge.node_to == node.node_id) {
                ret.push(edge);
            }
        }
        return ret;
    }

    getOutgoingEdges(node) {
        let ret = [];
        for (let edge of this.edges) {
            if (edge.node_from == node.node_id) {
                ret.push(edge);
            }
        }
        return ret;
    }

    getEdges(node) {
        let ret = [];
        for (let edge of this.edges) {
            if (edge.node_from == node.node_id || edge.node_from == node.node_id) {
                ret.push(edge);
            }
        }
        return ret;
    }
}

export { Network };
