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
import fiona
import geojson

def load(db,boundary):

    ## in 27700
    with fiona.open("/home/dave/projects/climate/v2-data/coastal/GB coast clipped.geojson") as src:
        profile = src.profile
        print(profile)

        coast = []
        for feat in src:
            coast.append(shape(feat.geometry))
        print("loaded coast outline")

        q=f"""select gid,ST_AsGeoJSON(ST_Transform(geom,27700))::json from boundary_{boundary}
              where ST_TRANSFORM(geom,4326) && ST_MakeEnvelope(-5.982067675100366,49.947685259857685,-4.430248827444115,50.38400527636708,4326);
        ;"""

        db.cur.execute(q)
        r = db.cur.fetchone()
        count = 0
        features = []
        while r:
            print(r[0])
            s = shape(r[1])

            for c in coast:
                if s.distance(c)<50:                         
                    feature = geojson.Feature(geometry=s, properties={})
                    features.append(feature)
            
            r = db.cur.fetchone()

            count +=1

        fc = geojson.FeatureCollection(features)
        with open('coastal-cornwall.geojson', 'w') as f:
            f.write(geojson.dumps(fc))

            
