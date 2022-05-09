# Climate tool for ECEHH/Cornwall Council

A tool for connecting together scientific information across climate, health and policy in Cornwall.

You can try the [beta version here](http://climate-tool.thentrythis.org/).
 
## Installing

### Server

    $ cd server
    $ npm install

To run:

    $ npm start

### Building the client (only needed for development):

    $ cd public
    $ npm install
	$ browserify -p esmify src/index.js -o bundle.js

## Setting up the PostGIS database

    $ sudo apt install postgis
    $ sudo su - postgres
    $ psql
    create database climate_geo_data;
    \connect climate_geo_data;
    CREATE EXTENSION postgis;

Creating and connecting a user for this db:

    create user climate_geo_data;
    alter user climate_geo_data with encrypted password '<insert password here>';
    grant all privileges on database climate_geo_data to climate_geo_data;`

Create a .env file in server and add the login info:

    DB_USER=climate_geo_data
    DB_PASS=<insert password here>
    DB_HOST=localhost:5432
    DB_DATABASE=climate_geo_data

### Importing GeoJSON into a table

    $ sudo apt install gdal-bin

    $ ogr2ogr -f "PostgreSQL" PG:"dbname=climate_geo_data user=climate_geo_data password=<insert password here> host=localhost" "MyData.geojson" -nln lsoa -append

### Backing up and restoring the whole database:

    pg_dump -h localhost -U climate_geo_data -W climate_geo_data > climate_geo_data_bak.sql

    psql -h localhost -U climate_geo_data -d climate_geo_data <  climate_geo_data_bak.sql

## Setting up systemd to run the server automatically

* Make a symlink from `climate-tool/server/` to `/var/www/climate-tool`
* Copy `ubuntu/climate-tool.service` to `/etc/systemd/system/`
* Start with `sudo service climate-tool start` and set it to run after reboot via `sudo systemtl enable climate-tool`.

## Importing ESRI shapefile data

    shp2pgsql -I -s 2263 SHAPEFILE.shp DATATABLE | psql -U DATABASE_USER -d DATABASE_NAME

Where 2263 is the spatial reference system or coordinate system of the shape file.

    