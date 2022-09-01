# Copyright (C) 2021 Then Try This
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the Common Good Public License Beta 1.0 as
# published at http://www.cgpl.org
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# Common Good Public License Beta 1.0 for more details.

# This script imports climate baseline records from HADUK NetCDF files
# downloaded directly from the MET office CEDA archive (you need a login)

# Currently there is no use for this data (mainly making sure we can
# read NetCDF if required). We create a GEOJSON geometry for the grid
# and populate the properties of each tile with the records by year
# for easy previewing (rather than using separate tables).

import * from netCDF4 as nc

def mkfn(path,y):
    return path+'tas_hadukgrid_uk_12km_ann_'+str(y)+'01-'+str(y)+'12.nc'

def print_info(path,year):
    ds = nc.Dataset(mkfn(path,year))
    print(ds)
    
def load_grid(path,year,tas):    
    ds = nc.Dataset(mkfn(path,year))
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
    
    
def load_year(path,year):
    ds = nc.Dataset(mkfn(path,year))
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


def import(path):
    #path = '/home/dave/projects/climate/v2-data/baseline/'

    create_tables({
        "baseline_grid":
        [["id","serial"],
         ["geom","geometry(geometry, 4326)"],
         ["properties","jsonb"]]
    })
    
    load_grid(path,1884,load_year(path,1884))
                
