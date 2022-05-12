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
const utils = require("./utils.js")

const no_data = `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .heavy { font: bold 10px sans-serif; }
  </style>
  <text x="100" y="35" class="heavy">No Data</text>
</svg>`

const graph_width = 650;
const graph_height = 270;
const winter_col = "#a4f9c8"
const summer_col = "#4c9f70"

function render_graph(decades_arr,offset,scale) {
    console.log([offset,scale]);
    
	var svg = new svgUtil.SVG(800,300);
	// assume decades list all are the same size
	let bar_width = graph_width/Object.keys(decades_arr[0]).length;

	if (decades_arr.length==1) {
		// draw the bars
		let x=100
		for (let dec of Object.keys(decades_arr[0])) {
			svg.add_bar(x,offset+graph_height,bar_width-2,decades_arr[0][dec]*scale,
						dec,decades_arr[0][dec],summer_col);
			x+=bar_width;
		}
	} else {
		let x=100
		for (let dec of Object.keys(decades_arr[0])) {
			svg.add_2bar(x,graph_height,bar_width-2,
						 decades_arr[0][dec]*scale,
						 decades_arr[1][dec]*scale,
						 dec,
						 decades_arr[0][dec],
						 decades_arr[1][dec],
						 winter_col,
						 summer_col);
			x+=bar_width;
		}
	}

	if (decades_arr.length==2) {
		svg.add_rect(540,0,80,30,summer_col);
		svg.add_rect(640,0,80,30,winter_col);
		
		svg.add_text(545,20,18,"Summer");
		svg.add_text(650,20,18,"Winter");
	}
	
	svg.add_line(90,graph_height+5,790,graph_height+5,1,"#000")
	svg.add_line(90,graph_height+5,90,5,1,"#000")

	let tick_units = 1;
	let maximum = 6;
	let data_type=$("#graph-type").val()
	if(data_type=="daily_precip") {
		svg.add_sideways_text(30,graph_height-50,"Millimetres per day");		
	}
	if(data_type=="mean_temp" ||
	   data_type=="max_temp" ||
	   data_type=="min_temp") {
		tick_units = 5;
		maximum = 30;
		svg.add_sideways_text(30,graph_height-50,"Degrees celsius");		
	}
	if(data_type=="mean_windspeed" ||
	   data_type=="max_windspeed" ||
	   data_type=="min_windspeed") {
		tick_units = 2;
		maximum = 8;
		svg.add_sideways_text(30,graph_height-50,"Metres per second");		
	}
	
	for (let i=0; i<=maximum; i+=tick_units) {
		svg.add_text(46,(graph_height-i*scale)+10,15,""+i.toFixed(2));		
	}
	
	return svg
}

function calc_scale(graph_data,height) {
	// get the min/max for eventual graph scaling
	let minimum = 999999;
	let maximum = 0;

	for (let decades of graph_data) {
		for (let dec of Object.keys(decades)) {
			if (minimum>decades[dec]) minimum = decades[dec]
			if (maximum<decades[dec]) maximum = decades[dec]
		}
	}

	//let maximum = 0;

	// let data_type=$("#graph-type").val()
	// if(data_type=="daily_precip") {
	// 	maximum = 5.5
	// }
	// if(data_type=="mean_temp" ||
	//    data_type=="max_temp" ||
	//    data_type=="min_temp") {
	// 	maximum = 27
	// }
	// if(data_type=="mean_windspeed" ||
	//    data_type=="max_windspeed" ||
	//    data_type=="min_windspeed") {
	// 	maximum = 8
	// }

    var offset=0;
    var scale=height/(maximum-minimum)
    
    if (minimum!=0) offset=minimum*scale;
    
	return [offset,scale]
}

function redraw_graph(graph_data) {
    let d = {}

    for (let el of graph_data) {
        d[el.year]=el.avg
    }

    console.log(d);

    let scale = calc_scale([d],graph_height-50)
    
	$("#graph").empty();
	$("#graph").append(render_graph([d],scale[0],scale[1]).svg);
}

function redraw_graph_seasonal(winter_data,summer_data) {
	let winter_decades = utils.calculate_decades(winter_data)
	let summer_decades = utils.calculate_decades(summer_data)
		
	$("#graph").empty();
	$("#graph").append(render_graph([winter_decades,summer_decades],
									calc_scale([winter_decades,summer_decades],graph_height-50)).svg);
}

function update_graph(lsoa_zones,time) {
    console.log(lsoa_zones);
	let locations = []
	for (let zone of lsoa_zones) {
		// keep duplicates for weighted averaging
		if (zone.uk_cri_location!=undefined) {			
			locations.push(zone.uk_cri_location)
		}
	}
	
	if (locations.length==0) {
		$("#graph").html(no_data);
		return
	}

	if (time=="yearly") {
		$.getJSON("/api/hadgem_rpc85",
				  {
					  table: $("#graph-type").val(),
					  locations: locations,
				  },
				  (data,status) => {
					  redraw_graph(data);
				  });
	}

    // else {	
	// 	$.getJSON("/api/future",
	// 			  {
	// 				  table: "future_winter_avg",
	// 				  zones: zones,
	// 				  data_type: $("#graph-type").val()
	// 			  },
	// 			  (winter_data,status) => {
	// 				  $.getJSON("/api/future",
	// 							{
	// 								table: "future_summer_avg",
	// 								zones: zones,
	// 								data_type: $("#graph-type").val()
	// 							},
	// 							(summer_data,status) => {									
	// 								redraw_graph_seasonal(winter_data,summer_data);
	// 							});
	// 			  });
	// }
}


export { update_graph, no_data }
