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
const colormap = require('colormap')
const network = require("./network2.js")

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
		this.map = leaflet_map
		this.zones = []
		this.layer_buffer = [L.layerGroup().addTo(this.map),
							 L.layerGroup().addTo(this.map)];
		this.current_layer_buffer=0;
		this.other_layer_buffer=1;

		let cols = colormap({
			colormap: 'bathymetry',
			nshades: 100,
			format: 'hex',
			alpha: 0.5
		})

		this.cols = cols;
		this.score_adjust=0.7;
		
		var legend = L.control({position: 'bottomleft'});
		legend.onAdd = (map) => {
			var div = L.DomUtil.create('div', 'info legend')
			div.innerHTML += '<h3>Index of Multiple Deprivation Score</h3>'
			for (let i = 1; i < 100; i+=10) {
				div.innerHTML += 					
				'<div class="key" style="background:' + cols[i] + '"></div> '+(i*this.score_adjust).toFixed(0)+"<br>"
					
			}
			return div;
		}
		legend.addTo(this.map)
		
		this.highlight_col = "#ffbc42"
		//this.zone_col = "#42273b"
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

	update_list(net) {
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
			let tiles = []
			for (let z of this.zones) {
				tiles.push(z.tile)
			}

			net.tiles=tiles
			net.buildGraph();

		} else {
			$("#results").css("display","none")
		}
		
		graph.update_graph(this.zones,$("#graph-time").val())
	}

	make_zone(feature,layer,net) {		
		let col = this.cols[Math.round(feature.properties.imdscore/this.score_adjust)]

		if (this.include(feature.properties.name)) {
			layer.setStyle({
				'fillColor': this.highlight_col,
				'fillOpacity': 1
			});
		} else {
			layer.setStyle({
				'fillColor': col,
				'fillOpacity': 1
			});
		}
		
		layer.setStyle({
			'color': "#e6e6e6",
			'weight': 1,
   		        'opacity': 1,
 		        'fillOpacity': 1
		});
		
		layer.on('click', () => {
 			if (!this.include(feature.properties.name)) {
				layer.setStyle({
					'fillColor': this.highlight_col,
					'fillOpacity': 1
				});
				this.zones.push({
					name: feature.properties.name,
					tile: feature.properties.zone
				})
			} else {
				layer.setStyle({
					'fillColor': col,
					'fillOpacity': 1
				});
				this.remove(feature.properties.name);
			}
			this.update_list(net);
		});

		layer.bindTooltip(feature.properties.name+"<br>IMD Score: "+feature.properties.imdscore).addTo(this.map);

		
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
	
	update(leaflet_map,net) {
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
						this.make_zone(feature,layer,net)
					}
				}).addTo(this.layer_buffer[this.current_layer_buffer]);
				
				this.swap_buffers(leaflet_map);
			});
	}
}

export { LSOAZones }
