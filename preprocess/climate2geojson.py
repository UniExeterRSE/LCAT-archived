import geojson

data_dir = "/home/dave/projects/climate/data/climate_data"
source_geojson = data_dir+"/25km_tiles/25km_tiles_cornwall.geojson"


with open(source_geojson) as f:
    sg = geojson.load(f)

    for f in sg.features:
        print(f)

    

