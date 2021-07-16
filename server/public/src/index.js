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

const $ = require("jquery")
const L = require("leaflet")
const zones = require("./lsoa.js")
const graph = require("./graph.js")

var leaflet_map = L.map('leaflet-map').setView([50.26123046875, -5.052745342254639], 10);

const z = new zones.LSOAZones(leaflet_map)

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(leaflet_map);

leaflet_map.on("moveend", function() { z.update(leaflet_map); });
$("#graph-type").on("change",function() { graph.update_graph(z.zones) })
$("#graph").html(graph.no_data)
z.update(leaflet_map)


