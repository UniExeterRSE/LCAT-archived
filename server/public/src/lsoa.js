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
const graph = require("./graph.js")

// helpers for map geometry
function lerp(a,b,t) {
	return a*(1-t)+b*t;
}

function zoom_to_tol(zoom) {
	let t = zoom/18;
	return lerp(0.001,0.000001,t);
}

function stringify_list(l) {
	if (l.length==0) return ""
	if (l.length==1) return ""+l[0]
	if (l.length==2) return l[0]+" and "+l[1]
	let c=0
	let ret=""
	for (let v of l) {
		if (c==l.length-1) {
			ret+=" and "+v
		} else {
			if (c==l.length-2) {
				ret+=v
			} else {
				ret+=v+", "
			}			
		}
		c+=1
	}
	return ret
}

class LSOAZones {
	constructor(leaflet_map) {
		this.zones = []
		this.layer_buffer = [L.layerGroup().addTo(leaflet_map),
							 L.layerGroup().addTo(leaflet_map)];
		this.current_layer_buffer=0;
		this.other_layer_buffer=1;

		this.highlight_col = "#ffbc42"
		this.zone_col = "#42273b"
	}

	include(name,zones) {
		for (let zone of this.zones) {
			if (zone.name==name) return true;
		}
		return false;
	}

	remove(name) {
		let new_zones=[]
		for (let zone of this.zones) {
			if (name!=zone.name) {
				new_zones.push(zone);
			}
		}
		this.zones=new_zones;
	}

	update_list() {
		$('#selected-list').empty()
		let zone_names=[]
		for (let zone of this.zones) {
			zone_names.push(zone.name)
			$('#selected-list').append($("<li>").html(zone.name))
		}

		if (zone_names.length>0) {
			$("#results").css("display","block")			
			$("#projected-regions").html(stringify_list(zone_names))
			$("#adaption-regions").html(stringify_list(zone_names))
		} else {
			$("#results").css("display","none")
		}
		
		graph.update_graph(this.zones,$("#graph-time").val())
	}

	make_zone(feature,layer) {		
		if (this.include(feature.properties.name)) {
			layer.setStyle({'color': this.highlight_col});
			layer.setStyle({'fillOpacity': 0.5});
		} else {
			layer.setStyle({'color': this.zone_col})
			layer.setStyle({'fillOpacity': 0.02});
		}
		
		layer.setStyle({'weight': 1});
		layer.setStyle({'opacity': 1});
		
		layer.on('click', () => {
 			if (!this.include(feature.properties.name)) {
				layer.setStyle({'color': this.highlight_col});
				layer.setStyle({'fillOpacity': 0.5});
				this.zones.push({
					name: feature.properties.name,
					tile: feature.properties.zone
				})
			} else {
				layer.setStyle({'color': this.zone_col});
				this.remove(feature.properties.name);
				layer.setStyle({'fillOpacity': 0.02});
			}
			this.update_list();
		});
		
		layer.on('mouseover', function(e) {
			layer.bringToFront();
			layer.setStyle({'weight': 3});
		});
		layer.on('mouseout', function(e) {
			layer.setStyle({'weight': 1});
		});
		
		//layer.bindPopup(feature.properties.name)
	}

	swap_buffers(leaflet_map) {
		// double buffer to stop flickering
		leaflet_map.removeLayer(this.layer_buffer[this.other_layer_buffer]);
		this.layer_buffer[this.other_layer_buffer].clearLayers();
     	this.layer_buffer[this.current_layer_buffer].addTo(leaflet_map);
		
		if (this.current_layer_buffer==0) {
			this.current_layer_buffer=1;
			this.other_layer_buffer=0;
		} else {
			this.current_layer_buffer=0;
			this.other_layer_buffer=1;
		}
	}
	
	update(leaflet_map) {
		let b = leaflet_map.getBounds();
		
		$.getJSON(
			"/api/lsoa",
			{
				left: b._southWest.lng,
				bottom: b._southWest.lat,
				right: b._northEast.lng,
				top: b._northEast.lat,
				tolerance: zoom_to_tol(leaflet_map.getZoom())
			},
			(data,status) => {
				L.geoJSON(data, {
					onEachFeature: (feature,layer) => {
						this.make_zone(feature,layer)
					}
				}).addTo(this.layer_buffer[this.current_layer_buffer]);
				
				this.swap_buffers(leaflet_map);
			});
	}
}

export { LSOAZones }
