# Install instructions

## NodeJS Server

    $ cd server
    $ npm install

To run:

    $ npm start

The server also provides an admin interface to allow editing of
network data, see below for setting of passwords.
   
## React client for development:

    $ cd client
    $ npm install

To run:
    
  	$ npm start

If running locally, we can use the React development server which will
detect a conflict on port 3000 (where the climate tool server is
running), and launch on port 3001 instead. When running in development
mode, the client routes it's API calls to the correct port 3000 so it
mimics running on the production server for debugging.

The server is also set up to allow same-origin requests from
localhost:3001 to allow this to work.

## Building the client for production use

    $ cd client
    $ npm run build
    $ cp build/* ../server/public -r

This installs a production build that will be served by the climate
tool nodejs server.
    
# Setting up the PostGIS database

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

