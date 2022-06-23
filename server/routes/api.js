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

var express = require('express');
var router = express.Router();

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

require('dotenv').config()

// Setup connection
var username = process.env.DB_USER
var password = process.env.DB_PASS
var host = process.env.DB_HOST
var database = process.env.DB_DATABASE
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// for basic security
function is_valid_hadgem_table(table) {
    return ["hadgem_rcp85_rain_ann",
            "hadgem_rcp85_rain_djf",
            "hadgem_rcp85_rain_jja",
            "hadgem_rcp85_tavg_ann",
            "hadgem_rcp85_tavg_djf",
            "hadgem_rcp85_tavg_jja",
            "hadgem_rcp85_tmax_ann",
            "hadgem_rcp85_tmax_djf",
            "hadgem_rcp85_tmax_jja",
            "hadgem_rcp85_tmin_ann",  
            "hadgem_rcp85_tmin_djf",
            "hadgem_rcp85_tmin_jja"].includes(table);
}

function is_valid_grid_table(table) {
    return ["lsoa_grid_mapping",
            "msoa_grid_mapping",
            "counties_grid_mapping"].includes(table);
}

function is_valid_region_table(table) {
    return ["lsoa","msoa","counties"].includes(table);
}

// get GeoJSONs of regions given a bounding box and detail
// tolerance from zoom level 
router.get('/region', function (req, res) {
    let table = req.query.table;
	let tolerance = req.query.tolerance;
	let left = req.query.left;
	let bottom = req.query.bottom;
	let right = req.query.right;
	let top = req.query.top;

    // convert to match imported data (todo: should probably
    // fix this at import time)
    var name_col="lsoa11nm";
    if (table=="msoa") name_col="msoa11nm";
    if (table=="counties") name_col="ctyua16nm";

    // lsoa and msoa are in british national grid 27700
    var srid = 27700
    // counties in lat/lng
    if (table=="counties") srid=4326
    
    if (is_valid_region_table(table)) {
        var client = new Client(conString);
        client.connect();
                
	    // build a new geojson in 4326 coords given the bounding box
        // and zoom detail, add the name of the region and it's IMD
        // score (simplify is specified in metres/pixel so need to
        // ensure geometry e.g. counties are in 27700 coords before
        // ST_Simplify)
	    var lsoa_query = `select json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(json_build_object(
                   'type', 'Feature',
                   'properties', json_build_object('gid', gid,
                                                   'name', `+name_col+`, 
                                                   'imdscore', imdscore),
                   'geometry', ST_AsGeoJSON(
                                 ST_Transform(
                                   ST_Simplify(
                                     ST_Transform(geom,27700),$1),4326))::json
                   ))
              )
         	  from `+table+` where geom && ST_TRANSFORM(ST_MakeEnvelope($2,$3,$4,$5,4326),`+srid+`);`

	    var query = client.query(new Query(lsoa_query,
                                           [tolerance,
                                            left,bottom,right,top]));

	    query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            res.send(result.rows[0].json_build_object);
            res.end();
		    client.end();
        });
        query.on("error", function (err, result) {
            console.log("------------------error-------------------------");
            console.log(req);
            console.log(err);
        });
    }
});

/*// return list of yearly averages for a data type
router.get('/future', function (req, res) {
	let zones = req.query.zones;
    if (zones!=undefined) {
	    let data_type = req.query.data_type;
	    let table = req.query.table; 

        var client = new Client(conString);
        client.connect();
        
	    var q=`select year,avg(value) from `+table+` 
           where zone in (`+zones.join()+`) and 
           type='`+data_type+`' group by year order by year`;
	    var query = client.query(new Query(q));
	    
	    query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            res.send(result.rows);
            res.end();
		    client.end();
        });
    }
});
*/

// return list of decade averages for a hadgem table given a list of regions
router.get('/hadgem_rpc85', function (req, res) {
	let locations = req.query.locations;
	let table = req.query.table; 
	let region_grid = req.query.regionType+"_grid_mapping";

    if (locations!=undefined &&
        is_valid_hadgem_table(table) &&
        is_valid_grid_table(region_grid)) {

        if (!Array.isArray(locations)) {
            locations=[locations];
        }

	    var client = new Client(conString);
        client.connect();

        // find all the tiles covered by the selected geometry, use
        // distinct to remove duplicates and average the selected
        // climate variable for each year in the model data
        var q=`select year,avg(median) from `+table+` 
               where location in (select distinct tile_id from `+region_grid+`
               where geo_id in (`+locations.join()+`)) group by year order by year;`

	    var query = client.query(new Query(q));
	    
	    query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            res.send(result.rows);
            res.end();
		    client.end();
        });
        query.on("error", function (err, result) {
            console.log("------------------error-------------------------");
            console.log(req);
            console.log(err);
        });
    }
});


router.get('/hadgem_rpc85_prediction', function (req, res) {
	let locations = req.query.locations;
	let average = req.query.average; 
	let year = req.query.year; 
	let region_grid = req.query.regionType+"_grid_mapping";

    if (locations!=undefined &&
        is_valid_grid_table(region_grid)) {

        if (!Array.isArray(locations)) {
            locations=[locations];
        }

	    var client = new Client(conString);
        client.connect();

        // combine the tavg,tmin,tmax and rain predictions averaged over the
        // locations provided
        var sq=`(select distinct tile_id from `+region_grid+` where geo_id in (`+locations.join()+`))`;
        
        var q=`select avg(tavg.median), avg(tmin.median), avg(tmax.median), avg(rain.median)
               from hadgem_rcp85_tavg_`+average+` as tavg
               join hadgem_rcp85_tmin_`+average+` as tmin on tmin.location in `+sq+` and tmin.year=tavg.year
               join hadgem_rcp85_tmax_`+average+` as tmax on tmax.location in `+sq+` and tmax.year=tavg.year
               join hadgem_rcp85_rain_`+average+` as rain on rain.location in `+sq+` and rain.year=tavg.year
               where tavg.location in `+sq+`;`;

        console.log(q);
        
	    var query = client.query(new Query(q));
	    
	    query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            res.send(result.rows);
            res.end();
		    client.end();
        });
        query.on("error", function (err, result) {
            console.log("------------------error-------------------------");
            console.log(req);
            console.log(err);
        });
    }
});

router.get('/network_edges', function (req, res) {
	var client = new Client(conString);
    client.connect();

    // find all the tiles covered by the selected geometry, use
    // distinct to remove duplicates and average the selected
    // climate variable for each year in the model data
    var q=`select * from network_edges;`

	var query = client.query(new Query(q));
	
	query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows);
        res.end();
		client.end();
    });
    query.on("error", function (err, result) {
        console.log("------------------error-------------------------");
        console.log(req);
        console.log(err);
    });
});

router.get('/network_nodes', function (req, res) {
	var client = new Client(conString);
    client.connect();

    // find all the tiles covered by the selected geometry, use
    // distinct to remove duplicates and average the selected
    // climate variable for each year in the model data
    var q=`select * from network_nodes;`

	var query = client.query(new Query(q));
	
	query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows);
        res.end();
		client.end();
    });
    query.on("error", function (err, result) {
        console.log("------------------error-------------------------");
        console.log(req);
        console.log(err);
    });    
});

/*
// general purpose for debugging
router.get('/geojson', function (req, res) {
    let table = req.query.table;
	let tolerance = req.query.tolerance;
	let left = req.query.left;
	let bottom = req.query.bottom;
	let right = req.query.right;
	let top = req.query.top;

    var client = new Client(conString);
    client.connect();
    
    var str_query = `select json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(json_build_object(
                   'type', 'Feature',
                   'geometry', ST_AsGeoJSON(ST_Transform(geom,4326))::json
                   ))
              )
         	  from `+table+` where geom && ST_MakeEnvelope(`+left+`, `+bottom+`, `+right+`, `+top+`, 4326);`
    
	var query = client.query(new Query(str_query));

	query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].json_build_object);
        res.end();
		client.end();
    });
});

*/

router.get('/ping', function (req, res) {
    res.send();
    res.end();
});

module.exports = router;
