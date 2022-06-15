# Climate tool for ECEHH/Cornwall Council

A tool for connecting together scientific information across climate, health and policy in Cornwall.

You can try the [beta version here](http://climate-tool.thentrythis.org/).
 
## Installing

### NodeJS Server

    $ cd server
    $ npm install

To run:

    $ npm start

### React client:

    $ cd client
    $ npm install

To run:
    
  	$ npm start

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
    ADMIN_PASS=<insert password here>

### Building the database

The database links together a lot of [public open data repositories](https://docs.google.com/spreadsheets/d/15-o9i60fOi0MoV2siL9rCrqPTOReYOt4TiaoGsuA5SA/edit?ouid=102175944541338588070&usp=sheets_home&ths=true)
which we have [archived here](https://static.thentrythis.org/data/climate-data/).
    
The data directory contains a set of python scripts to build the final
database from this data. We use a virtual environment to install all
the packages required.

Setting up the virtual environment:
   
    $ cd data
    $ python3 -m venv venv
    $ source venv/bin/activate
    $ pip install -r requirements.txt

Building the data (this takes a long time):
    
    $ cd data
    $ source venv/bin/activate
    $ ./build all

There are also separate build commands to build/rebuilt parts one at
time (see in the 'build' script). When running on a server, we don't
want to overheat, so you can leave this running for several days at
max 25% cpu:
    
    $ nohup cpulimit -l 25 -- ./build all 
        
### Backing up and restoring the whole database:

    pg_dump -h localhost -U climate_geo_data -W climate_geo_data > climate_geo_data_bak.sql

    psql -h localhost -U climate_geo_data -d climate_geo_data <  climate_geo_data_bak.sql

## Setting up systemd to run the server automatically

* Make a symlink from `climate-tool/server/` to `/var/www/climate-tool`
* Copy `ubuntu/climate-tool.service` to `/etc/systemd/system/`
* Start with `sudo service climate-tool start` and set it to run after reboot via `sudo systemtl enable climate-tool`.

## Geographical coordinates used

  * British National Grid (BNG) OSGB 1936 = EPSG:27700
    - United Kingdom Ordnance Survey
    - Used by grid location for model data (uk-cli)
    - Used for LSOA geojsons

  * EPSG:4326 / WGS 84, latitude/longitude coordinate system based on
    the Earth's center of mass, used by the Global Positioning System
    among others. EPSG:3857 - Web Mercator projection used for display
    by many web-based mapping tools, including Google Maps and
    OpenStreetMap
    - Our target coordinate system for mapping


