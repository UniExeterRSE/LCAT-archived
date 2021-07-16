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
const svgUtil = require("./svg.js")

function arr2avg(arr) {
	let ret=0;
	for (let v of arr) {
		ret+=v;
	}
	return ret/arr.length
}

const no_data = `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .heavy { font: bold 10px sans-serif; }
  </style>
  <text x="100" y="35" class="heavy">No Data</text>
</svg>`

function render_graph(decades,scale) {
	var svg = new svgUtil.SVG(800,200);
	let graph_width = 650;
	let graph_height = 200;
	let bar_width = graph_width/Object.keys(decades).length;

	// draw the bars
	let x=100
	for (let dec of Object.keys(decades)) {
		svg.add_bar(x,170,bar_width-2,decades[dec]*scale,"20"+dec+"0",decades[dec]);
		x+=bar_width;
	}

	svg.add_line(90,175,790,175,1,"#000")
	svg.add_line(90,175,90,5,1,"#000")

	for (let i=0; i<5; i++) {
		let p = i*(graph_height/5);
		svg.add_text(50,(graph_height-p)-55,""+(p/scale));		
	}

	let data_type=$("#graph-type").val()
	if(data_type=="daily_precip") {
		svg.add_sideways_text(40,150,"Millimetres per day");		
	}
	if(data_type=="mean_temp" ||
	   data_type=="max_temp" ||
	   data_type=="min_temp") {
		svg.add_sideways_text(40,150,"Degrees celsius");		
	}
	if(data_type=="mean_windspeed" ||
	   data_type=="max_windspeed" ||
	   data_type=="min_windspeed") {
		svg.add_sideways_text(40,150,"Metres per second");		
	}
	return svg
}

function calculate_decades(graph_data) {
	let decades = {};

	// collect values for each decade
	for (let year of graph_data) {
		let dec = Math.floor((year.year%2000)/10);
		if (decades[dec]==undefined) {
			decades[dec]=[year.avg]
		} else {
			decades[dec].push(year.avg)
		}
	}

	// average them together
	for (let dec of Object.keys(decades)) {
		decades[dec]=arr2avg(decades[dec])
	}

	return decades
}

function redraw_graph(graph_data,scale) {
	let decades = calculate_decades(graph_data)
	
	// get the min/max for eventual graph scaling
	let minimum = 999999;
	let maximum = 0;

	for (let dec of Object.keys(decades)) {
		if (minimum>decades[dec]) minimum = decades[dec]
		if (maximum<decades[dec]) maximum = decades[dec]
	}
	
	$("#graph").empty();
	$("#graph").append(render_graph(decades,scale).svg);
}

var graph_scale=8;

function update_graph(lsoa_zones) {
	let zones = []
	for (let zone of lsoa_zones) {
		if (zone.tile!=undefined && !zones.includes(zone.tile)) {			
			zones.push(zone.tile)
		}
	}
		
	if (zones.length>0) {
		$.getJSON("/api/future",
				  {
					  zones: zones,
					  data_type: $("#graph-type").val()
				  },
				  function (data,status) {
					  redraw_graph(data,graph_scale);
				  });
	} else {
		$("#graph").html(no_data);
	}
}


export { update_graph }
