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

# This script imports climate predictions downloaded from the
# http://uk-cri.org climate risk indicators, these are based on the
# MET Office HADGEM RCP85 model. They are 12km gridded model
# predictions, and include other higher level risk indicators we might
# be able to make use of in future.

# We import a grid as GEOJSON geometry and the model data each into
# their own tables indexed by grid cell id

import csv
import geojson
import psycopg2
from shapely.geometry import shape, Point

# Insert IMD scores into each lsoa zone GEOJSON where the name matches
# (We need the lsoa zones present to do this)


def prepare_col(db,table):
    q='alter table '+table+' add column if not exists imdscore real default 0;'
    db.cur.execute(q)
    db.conn.commit()
    
def load_lsoa(db,fn):
    # add the column to the lsoa GEOJSON
    q="alter table lsoa add column if not exists imdscore real;"
    db.cur.execute(q)
    db.conn.commit()
    with open(fn, newline='') as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                #print(row)
                # get the IMD score only
                if row[5].startswith("a.") and row[2]=="Score":
                    lsoa_code = row[0]
                    score = row[4]                                  
                    q=f"update lsoa set imdscore='{score}' where lsoa11cd='{lsoa_code}';"
                    print(q)
                    db.cur.execute(q)                
                    db.conn.commit()        

def load_msoa(db,fn):
    # a slightly different csv file
    q="alter table msoa add column if not exists imdscore real;"
    db.cur.execute(q)
    db.conn.commit()
    with open(fn, newline='') as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                msoa_code = row[0]
                score = row[7]                                  
                q=f"update msoa set imdscore='{score}' where msoa11cd='{msoa_code}';"
                print(q)
                db.cur.execute(q)                
        db.conn.commit()        

def load_counties(db):
    q=f"select imdscore,ST_AsGeoJSON(ST_Transform(geom,4326))::json from msoa;"
    db.cur.execute(q)
    msoas = db.cur.fetchall()
    
    # for each county
    q=f"select gid from counties;"
    db.cur.execute(q)
    for geo_id in db.cur.fetchall():
        q=f"select ST_AsGeoJSON(ST_Transform(geom,4326))::json from counties where gid={geo_id[0]}"
        db.cur.execute(q)
        geo = db.cur.fetchone()[0]
        count=0
        imd_total=0
        for msoa in msoas:
            if shape(msoa[1]).intersects(shape(geo)):        
                # add if inside
                imd_total+=msoa[0]
                count+=1
            
        # average update
        imd = imd_total/float(count)
        q=f"update counties set imdscore='{imd}' where gid='{geo_id[0]}';"
        print(q)
        db.cur.execute(q)                
        db.conn.commit()        
