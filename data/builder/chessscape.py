import netCDF4 as nc
from builder import climate_db
from psycopg2.extras import execute_values
import numpy
import geojson

def print_info(path):
    ds = nc.Dataset(path)
    print(ds)

def load_grid(db,fn):        
    features = []
   
    ds = nc.Dataset(fn)
    print(ds.variables)
    print(ds.dimensions)
    y_size = ds.dimensions['y'].size
    x_size = ds.dimensions['x'].size
    features = []
    for x in range(0,x_size-1):
        for y in range(0,y_size-1):
            print(ds['x'][y][x])
            features.append(geojson.Feature(id=x*y_size+y, geometry=geojson.Polygon([[
                (float(ds['x'][y][x]),float(ds['y'][y][x])),
                (float(ds['x'][y+1][x]),float(ds['y'][y+1][x])),
                (float(ds['x'][y+1][x+1]),float(ds['y'][y+1][x+1])),
                (float(ds['x'][y][x+1]),float(ds['y'][y][x+1]))]])))
        print((x*x_size+y)/(x_size*y_size))
            
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
        for y in range(0,y_size):            
            values = ds[variable][t][y]
            dat = []
            for x in range(0,x_size):
                value = values[x]
                grid_id = x*y_size+y
                if value is not numpy.ma.masked:
                    # convert from kelvin
                    if variable=="tas": value-=273.15
                    dat.append([grid_id,t,float(value)])
            q=f"insert into {table} (location,season,value) values %s"
            execute_values(db.cur,q,dat)
        print("committing")
        db.conn.commit()

# wget -r -nH --cut-dirs=5 -nc "ftp://username:password@ftp.ceda.ac.uk//badc/deposited2021/chess-scape/data/rcp85_bias-corrected/01/seasonal"

def import_grid(db):
    variable = "tas"
    path = "/home/dave/projects/climate/v2-data/chess/rcp85_bias-corrected/01/seasonal/"
    fn = "chess-scape_rcp85_bias-corrected_01_"+variable+"_uk_1km_seasonal_19801201-20801130.nc"
    print_info(path+fn)
    load_grid(db,path+fn)
        
def import_data(db):
    variable = "tas"
    path = "/home/dave/projects/climate/v2-data/chess/rcp85_bias-corrected/01/seasonal/"
    fn = "chess-scape_rcp85_bias-corrected_01_"+variable+"_uk_1km_seasonal_19801201-20801130.nc"
    print_info(path+fn)
    load_data(db,path+fn,"chessscape_seasonal_"+variable,variable)
