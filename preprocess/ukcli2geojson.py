import csv
import yaml
import psycopg2
import geojson
import json
from psycopg2.extras import Json

# new climate data import

with open('config.yml') as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

conn = psycopg2.connect(f"host={config['host']}\
                         dbname={config['dbname']} \
                         user={config['user']} \
                         password={config['password']}")
cur = conn.cursor()


def create_tables(data_cols):
    for t,c in data_cols.items():
        cur.execute(f"drop table {t}")
        cols = []
        for col in c:
            cols.append(f"{col[0]} {col[1]}")

        s = ", ".join(cols)
        q=f"create table {t} ({s});"
        print(q)
        cur.execute(q)
        conn.commit()

def import_feature(table,srid,feature_data):
    INSERT_STATEMENT = f'INSERT INTO {table} (id, geom, properties) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), {srid}), %s);'
    if feature_data.get('type') == 'FeatureCollection':
        for feature in feature_data['features']:
            import_feature(table,srid,feature)
    elif feature_data.get('type') == 'Feature':
        geojson = json.dumps(feature_data['geometry'])
        str_dict = dict((str(k), str(v)) for k, v in feature_data['properties'].items())
        cur.execute(INSERT_STATEMENT, (feature_data['id'], geojson, json.dumps(feature_data['properties'])))

path = '/home/dave/projects/climate/v2-data/uk-cri-climate/'

def import_grid(fn):
    grid_cols = {"location": 0, "east": 1, "north": 2}
    features = []

    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                x=int(row[grid_cols["east"]])
                y=int(row[grid_cols["north"]])
                size_metres_east = 12000                
                size_metres_north = -12000                
                features.append(geojson.Feature(id=row[grid_cols["location"]],
                                                geometry=geojson.Polygon([[
                                                    (x,y),
                                                    (x+size_metres_east,y),
                                                    (x+size_metres_east,y+size_metres_north),
                                                    (x,y+size_metres_north)]]),
                                                properties={}))
    import_feature("uk_cri_grid","27700",geojson.FeatureCollection(features))
    conn.commit()

def load_data(table,fn):
    grid_cols = {
      "year":0,
      "location":1,
      "lowest":2,
      "2nd_low":3,
      "median":4,
      "2nd_high":5,
      "highest":6
    }
    print("loading "+table)
    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                year=int(row[grid_cols["year"]])
                location=int(row[grid_cols["location"]])
                median=float(row[grid_cols["median"]])
                q=f"insert into {table} (location,year,median) values ({location},{year},{median});"               
                cur.execute(q)
        conn.commit()

    
data_cols = {
    "uk_cri_grid":
    [["id","serial"],
     ["geom","geometry(geometry, 27700)"],
     ["properties","jsonb"]]
}

model = "hadgem_rcp85"
variables = ["tavg","tmin","tmax","rain"]
periods = ["ann","djf","jja"]

for variable in variables:
    for period in periods:        
        data_cols[model+"_"+variable+"_"+period]=[["location","int"],
                                                  ["year","int"],
                                                  ["median","real"]]

create_tables(data_cols)

# load the grid as a geojson
import_grid(path+"location_codes.csv")

# load the climate data into ordinary tables
for variable in variables:
    for period in periods:
        table = variable+"_"+period
        fn = path+table+"_dc_ghadgem_rcp85_12km.csv"
        if variable=="rain": fn = path+table+"_pc_ghadgem_rcp85_12km.csv"
        load_data(model+"_"+table,fn)
        
