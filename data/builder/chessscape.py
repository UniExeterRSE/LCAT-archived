import netCDF4 as nc
from builder import climate_db

def print_info(path):
    ds = nc.Dataset(path)
    print(ds)

def import_grid(db,fn):        
    features = []
   
    ds = nc.Dataset(fn)
    print(ds.variables['latitude'])
    print(ds.dimensions)
    y_size = ds.dimensions['y'].size
    x_size = ds.dimensions['x'].size
    features = []
    n = 0
    for x in range(0,x_size):
        s = ""
        for y in range(0,y_size):
            features.append(geojson.Feature(id=x*y_size+y, geometry=geojson.Polygon([[
                (ds['lon'][x][y],ds['lat'][x][y]),
                (ds['lon'][x+1][y],ds['lat'][x+1][y]),
                (ds['lon'][x+1][y+1],ds['lat'][x+1][y+1]),
                (ds['lon'][x][y+1],ds['late'][x][y+1])]]),
                                            properties={}))
            n+=1
            
    db.import_geojson_feature("chessscape_grid","27700",geojson.FeatureCollection(features))
    db.conn.commit()
    
    
def load_data(db,fn,table,variable):
    data_cols={
        table: [["id","serial primary key"],
                ["location","int"],
                ["season","int"],
                ["value","real"]]
    }

    db.create_tables(data_cols)

    ds = nc.Dataset(fn)
    time_size = ds.dimensions['time'].size # P3M = 3 months?
    y_size = ds.dimensions['y'].size
    x_size = ds.dimensions['x'].size

    for t in range(0,time_size):
        print("t: "+str(t))        
        for x in range(0,x_size):
            s = []
            for y in range(0,y_size):
                grid_id = x*y_size+y
                value = ds[variable][t][y][x]
                if type(value) == float:
                    q=f"insert into {table} (location,season,median) values ({grid_id},{t},{value});"               
                    db.cur.execute(q)
            print("x: "+str(x))
        print("committing")
        db.conn.commit()

def import_data(db):
    path = "/home/dave/projects/climate/v2-data/chess/rcp85_bias-corrected/01/seasonal/"
    fn = "chess-scape_rcp85_bias-corrected_01_hurs_uk_1km_seasonal_19801201-20801130.nc"
    print_info(path+fn)
    load_data(db,path+fn,"chessscape_seasonal_hurs","hurs")
