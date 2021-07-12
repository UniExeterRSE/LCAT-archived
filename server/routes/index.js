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
var lsoa_query = `select ST_AsGeoJSON(wkb_geometry) from lsoa limit 1;`

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

/* GET Postgres JSON data */
router.get('/lsoa', function (req, res) {
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(lsoa_query));
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

module.exports = router;
