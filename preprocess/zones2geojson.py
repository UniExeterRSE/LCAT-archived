import geojson
import csv
import yaml
import psycopg2
from shapely.geometry import shape, Point

# connect lsoa regions with model 12km grid locations

with open('config.yml') as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

conn = psycopg2.connect(f"host={config['host']}\
                         dbname={config['dbname']} \
                         user={config['user']} \
                         password={config['password']}")
cur = conn.cursor()

data_dir = "/home/dave/projects/climate/data/climate_data"
source_geojson = data_dir+"/25km_tiles/25km_tiles_cornwall.geojson"

with open(source_geojson) as f:
    sg = geojson.load(f)

    tiles=[]
    for f in sg.features:
        #print(f)
        tiles.append({
            "fid": f["properties"]["fid"],
            "polygon": shape(f['geometry'])
        })

    i=1
    while i<2000:
        # get the centroids
        q=f"select ST_AsGeoJSON(ST_Centroid(ST_Transform(wkb_geometry,4326)))::json from lsoa where ogc_fid={i}"
        cur.execute(q)
        geo = cur.fetchone()
        if geo:
            p = Point(geo[0]["coordinates"])
            for tile in tiles:
                if tile["polygon"].contains(p):
                    # find the tiles they are in
                    zone = tile["fid"]
                    q=f"update lsoa set zone={zone} where ogc_fid={i}"
                    cur.execute(q)
                    conn.commit()
        i+=1
        
        


