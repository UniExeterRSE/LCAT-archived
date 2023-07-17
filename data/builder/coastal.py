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

from shapely.geometry import shape, Point
import geojson

def complexity(s):
    r = 0
    for ss in s:
        r+=len(ss.coords)
    return r

def load(db,boundary,outline_file):

    ## in 27700
    with open(outline_file) as f:
        src = geojson.load(f)
        print(src.keys())
        coast = [] # currently only one outline...
        for feat in src.features:
            s = shape(feat.geometry)
            coast.append([s,s.simplify(tolerance=10000)])

        print("coasts: "+
              str(coast[0][0].length)+" vs "+
              str(coast[0][1].length))
        
        print("loaded coast outline ("+str(len(coast))+")")

        q=f"""select gid,ST_AsGeoJSON(ST_Transform(geom,27700))::json from {boundary};"""

        db.cur.execute(q)
        r = db.cur.fetchone()
        count = 0
        features = []

        update_cur = db.conn.cursor()
        
        while r: # load each boundary shape
            s = shape(r[1])

            coastal = 0
            for c in coast:
                # 10km check against low res version
                if s.distance(c[1])<10000:
                    if s.distance(c[0])<50: # are we within 50 meters of the boundary anywhere?
                        # save geometery for debugging
                        feature = geojson.Feature(geometry=s, properties={})
                        features.append(feature)
                        coastal = 1
                        break
                    
            table = f"{boundary}_hazards";
            
            q = f"""update {table} set coastal={coastal} where gid={r[0]};
                    insert into {table} (gid, coastal)
                    select {r[0]}, {coastal}
                    where not exists (select 1 from {table} where gid={r[0]});"""
            update_cur.execute(q)
            print("coastal calc for "+boundary+": "+str(r[0])+": "+str(coastal)+" "+str(count))            
            r = db.cur.fetchone()
            count +=1
            db.conn.commit()
            
        fc = geojson.FeatureCollection(features)
        with open('coastal-'+boundary+'.geojson', 'w') as f:
            f.write(geojson.dumps(fc))


