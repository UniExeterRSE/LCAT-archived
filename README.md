# Climate tool for ECEHH/Cornwall Council

A tool for connecting together scientific information across climate, health and policy in Cornwall.

## Installing

### Server

`$ cd server`
`$ npm install`

To run:

`$ npm start`

### Client (only needed for development):

`$ cd public`
`$ npm install`

## Setting up the PostGIS database

`$ sudo apt install postgis
$ sudo su - postgres
$ psql
$ create database climate_geo_data;
$ \connect climate_geo_data;
$ CREATE EXTENSION postgis;`

Creating and connecting a user for this db:

`$create user climate_geo_data;
$alter user climate_geo_data with encrypted password '<insert password here>';
$grant all privileges on database climate_geo_data to climate_geo_data;`

Create a .env file in server and add the login info:

`DB_USER=climate_geo_data
DB_PASS=<insert password here>
DB_HOST=localhost:5432
DB_DATABASE=climate_geo_data`

### Importing GeoJSON into a table

sudo apt install gdal-bin

ogr2ogr -f "PostgreSQL" PG:"dbname=climate_geo_data user=climate_geo_data password=<insert password here> host=localhost" "MyData.geojson" -nln lsoa -append

