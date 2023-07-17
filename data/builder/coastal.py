# Copyright (C) 2023 Then Try This
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

# use the coastal outline to determine municipal
# boundaries that are located next to the sea

def load(db,boundary,outline_file):

    # load in our outline file - this is in 27700
    # grid so that we can compare in metres
    with open(outline_file) as f:
        src = geojson.load(f)
        coast = [] # currently only one outline... hopefully one day NI too
        for feat in src.features:
            s = shape(feat.geometry)
            # make a simplified version of the outline for fast check
            coast.append([s,s.simplify(tolerance=10000)])

        # get our boundary shapes - convert them into 27700 too 
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
                # first a 10km check against low res version
                if s.distance(c[1])<10000:
                    # if we are, check if we are within 50 meters of the boundary
                    # (50m is an arbitrary amount that allows for mathematical inaccuracies)
                    if s.distance(c[0])<50: 
                        # save geometery to geojson for debugging and sanity checks
                        feature = geojson.Feature(geometry=s, properties={})
                        features.append(feature)
                        coastal = 1
                        break
                    
            # now we update our hazards table with the result
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

        # save out the geojson file for checking in qgis
        fc = geojson.FeatureCollection(features)
        with open('coastal-'+boundary+'.geojson', 'w') as f:
            f.write(geojson.dumps(fc))


