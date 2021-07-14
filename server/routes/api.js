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

/* GET Postgres JSON data */
router.get('/lsoa', function (req, res) {
	let tolerance = req.query.tolerance;
	let left = req.query.left;
	let bottom = req.query.bottom;
	let right = req.query.right;
	let top = req.query.top;

    var client = new Client(conString);
    client.connect();
	
	var lsoa_query = `select json_build_object(
                'type', 'FeatureCollection',
                'features', json_agg(json_build_object(
                   'type', 'Feature',
                   'properties', json_build_object('name', lsoa01nm),
                   'geometry', ST_AsGeoJSON(
                                   ST_Transform(ST_Simplify(wkb_geometry,`+tolerance+`),4326))::json
                   ))
              )
         	  from lsoa where wkb_geometry && ST_MakeEnvelope(`+left+`, `+bottom+`, `+right+`, `+top+`, 4326);`

	var query = client.query(new Query(lsoa_query));

	query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].json_build_object);
        res.end();
		client.end();
    });
});

router.get('/ping', function (req, res) {
    res.send();
    res.end();
});

module.exports = router;
