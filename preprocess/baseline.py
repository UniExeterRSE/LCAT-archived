import netCDF4 as nc
import csv
import yaml
import psycopg2
import geojson
import json
from psycopg2.extras import Json

with open('config.yml') as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

conn = psycopg2.connect(f"host={config['host']}\
                         dbname={config['dbname']} \
                         user={config['user']} \
                         password={config['password']}")
cur = conn.cursor()

data_cols = {
    "baseline_grid":
    [["id","serial"],
     ["geom","geometry(geometry, 4326)"],
     ["properties","jsonb"]],
}

def create_tables():
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

def import_feature(feature_data):
    INSERT_STATEMENT = 'INSERT INTO baseline_grid (id, geom, properties) VALUES (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), %s);'
    if feature_data.get('type') == 'FeatureCollection':
        for feature in feature_data['features']:
            import_feature(feature)
    elif feature_data.get('type') == 'Feature':
        geojson = json.dumps(feature_data['geometry'])
        str_dict = dict((str(k), str(v)) for k, v in feature_data['properties'].items())
        cur.execute(INSERT_STATEMENT, (feature_data['id'], geojson, json.dumps(feature_data['properties'])))

path = '/home/dave/projects/climate/v2-data/baseline/'

start = 1888
end = 2019

def mkfn(y):
    return path+'tas_hadukgrid_uk_12km_ann_'+str(y)+'01-'+str(y)+'12.nc'

def print_info(year):
    ds = nc.Dataset(mkfn(year))
    print(ds)
    
def load_grid(year,tas):    
    ds = nc.Dataset(mkfn(year))
    print(ds.variables['latitude'])
    print(ds.dimensions)
    lon_size = ds.dimensions['projection_y_coordinate'].size
    lat_size = ds.dimensions['projection_x_coordinate'].size
    features = []
    n = 0
    for x in range(0,lon_size-1):
        s = ""
        for y in range(0,lat_size-1):
            val = tas[y][x]
            if not val>0: val = 0
            else: print(val)
            lat = ds['latitude'][x][y]
            lon = ds['longitude'][x][y]
            features.append(geojson.Feature(id=n, geometry=geojson.Polygon([[
                (ds['longitude'][x][y],ds['latitude'][x][y]),
                (ds['longitude'][x+1][y],ds['latitude'][x+1][y]),
                (ds['longitude'][x+1][y+1],ds['latitude'][x+1][y+1]),
                (ds['longitude'][x][y+1],ds['latitude'][x][y+1])]]),
                                            properties={str(year):val}))
            n+=1
            
    import_feature(geojson.FeatureCollection(features))
    conn.commit()
    
    
def load_year(year):
    ds = nc.Dataset(mkfn(year))
    time_size = ds.dimensions['time'].size
    y_size = ds.dimensions['projection_y_coordinate'].size
    x_size = ds.dimensions['projection_x_coordinate'].size
    ret = []    
    for x in range(0,x_size):
        s = []
        for y in range(0,y_size):
            s.append(ds['tas'][0][y][x])
        ret.append(s)
    return ret

#print_info(2019)

#create_tables()
load_grid(1884,load_year(1884))
                
