var express = require('express');
var router = express.Router();

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

// Setup connection
var username = "climate_geo_data" // sandbox username
var password = "poodles" // read only privileges on our table
var host = "localhost:5432"
var database = "climate_geo_data" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var lsoa_query = `select ST_AsGeoJSON(ST_Transform(wkb_geometry,4326)) from lsoa limit 3;`

/* GET Postgres JSON data */
router.get('/lsoa', function (req, res) {
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(lsoa_query));
    query.on("row", function (row, result) {
		console.log(row.st_asgeojson);
        result.addRow(row.st_asgeojson);
    });
    query.on("end", function (result) {
        res.send(result.rows[0]);
        res.end();
    });
});

router.get('/ping', function (req, res) {
    res.send();
    res.end();
});

module.exports = router;
