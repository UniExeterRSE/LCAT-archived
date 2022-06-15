# Copyright (C) 2022 Then Try This
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the Common Good Public License Beta 1.0 as
# published at http://www.cgpl.org
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# Common Good Public License Beta 1.0 for more details.

import geojson
import psycopg2
from shapely.geometry import shape, Point

# This script connects the input arbitrary geographic zones with
# the climate data tiles in various ways

# simple one used in the prototype - assumes zones (LSOA in this case) are generally
# smaller than the tiles (22km in the prototype's case) and writes a single
# grid into the geometry table
def simple(db,geo_table):
    # get the tile geometry in lat/lng
    # get the tile geometry in lat/lng
    db.create_tables({
        f"{geo_table}_grid_mapping":
        [["id","serial primary key"],
         ["geo_id","int"], # foreign key???
         ["tile_id","int"]]})
    
    q=f"select id,ST_AsGeoJSON(ST_Transform(geom,4326))::json from uk_cri_grid"
    db.cur.execute(q)
    location_squares = db.cur.fetchall()

    i=1
    while i<34753: # hack = max(gid)
        # get the geom centroids
        q=f"select ST_AsGeoJSON(ST_Centroid(ST_Transform(geom,4326)))::json from {geo_table} where gid={i}"
        db.cur.execute(q)
        geo = db.cur.fetchone()
        if geo:
            p = Point(geo[0]["coordinates"])
            for square in location_squares:
                # search the climate tile that the centroid of this zone is in
                if shape(square[1]).contains(p):
                    # find the tiles they are in
                    # todo - get closest if none
                    location = square[0]
                    q=f"insert into {geo_table}_grid_mapping (geo_id,tile_id) values ({i},{location})"
                    db.cur.execute(q)
                    db.conn.commit()
        print(i)
        i+=1

# allows for:
# * a zone containing multiple climate grid tiles - use a separate mapping table
def multi(db,geo_table):
    # get the tile geometry in lat/lng
    db.create_tables({
        f"{geo_table}_grid_mapping":
        [["id","serial primary key"],
         ["geo_id","int"], # foreign key???
         ["tile_id","int"]]})
    
    q=f"select id,ST_AsGeoJSON(ST_Transform(geom,4326))::json from uk_cri_grid"
    db.cur.execute(q)
    location_squares = db.cur.fetchall()

    q=f"select gid from {geo_table}"
    db.cur.execute(q)
    geometry = db.cur.fetchall()
    
    for geo_id in geometry:
        q=f"select ST_AsGeoJSON(ST_Transform(geom,4326))::json from {geo_table} where gid={geo_id[0]}"
        db.cur.execute(q)
        geo = db.cur.fetchone()[0]
        count=0
        for square in location_squares:
            # find the climate tiles that intersect with this zone
            if shape(square[1]).intersects(shape(geo)):
                # find the tiles they are in
                # todo - get closest if none
                tile_id = square[0]
                q=f"insert into {geo_table}_grid_mapping (geo_id,tile_id) values ({geo_id[0]},{tile_id})"
                db.cur.execute(q)
                count+=1
        print(str(geo_id[0])+": "+str(count))
    db.conn.commit()



