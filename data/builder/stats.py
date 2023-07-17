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

# This script creates a command line interface for building and updating
# the climate tool database, as well as providing documentation of the
# recipes for how it's done

import builder.nfvi_sfri

def do_stats(db,table,col):
    print(table,col)
    
    q=f"select count(*) from {table};"
    db.cur.execute(q)
    count = db.cur.fetchone()[0]
    dec = count/10;
    sq=f"select avg({col}) from {table}" 
    q=f"insert into stats (key, value) values ('{table}_{col}_avg',({sq}));"
    db.cur.execute(q)
    sq=f"select min({col}) from {table}" 
    q=f"insert into stats (key, value) values ('{table}_{col}_min',({sq}));"
    db.cur.execute(q)
    sq=f"select max({col}) from {table}" 
    q=f"insert into stats (key, value) values ('{table}_{col}_max',({sq}));"
    db.cur.execute(q)
    
    for d in range(1,10):
        sq=f"select {col} from {table} order by {col} desc limit 1 offset {dec*d}" 
        q=f"insert into stats (key, value) values ('{table}_{col}_dec_{d}',({sq}));"
        db.cur.execute(q)

    db.conn.commit()


def compute(db):
    db.create_tables({
        "stats":
        [["id","serial primary key"],
         ["key","text unique"],
         ["value","real"]]
    })
    
    tables = ["lsoa","msoa","uk_counties","la_districts","sc_dz","parishes"]
    
    # climatejust nfvi/sfri
    for table in tables:        
        for col in builder.nfvi_sfri.cols+["imd_rank","imd_decile"]:
            do_stats(db,"boundary_"+table+"_vulnerabilities",col)

    
def compute_climate(db):
    variables = ['tas','tasmin','tasmax','pr','rsds','sfcWind']
    gmin = {}
    gmax = {}

    for var in variables:
        gmin[var]=9999
        gmax[var]=0

    
    for climate in ["chess_scape_rcp85_annual","chess_scape_rcp85_summer","chess_scape_rcp85_winter",
                    "chess_scape_rcp60_annual","chess_scape_rcp60_summer","chess_scape_rcp60_winter"]:
        vardec=[]
        name=[]
        for variable in variables:                
            for decade in ["1980", "1990", "2000", "2010", "2020", "2030", "2040", "2050", "2060", "2070"]:
                name.append(f"{variable}_{decade}_avg")
                name.append(f"{variable}_{decade}_min")
                name.append(f"{variable}_{decade}_max")
                vardec.append(f"avg({variable}_{decade}) as {variable}_{decade}_avg")
                vardec.append(f"min({variable}_{decade}) as {variable}_{decade}_min")
                vardec.append(f"max({variable}_{decade}) as {variable}_{decade}_max")


        q=f"select {', '.join(vardec)} from {climate}"
        db.cur.execute(q)
        ret = db.cur.fetchall()
        
        for i,var in enumerate(ret[0]):
            # compute global min/max (of AVERAGES)
            v = name[i].split("_")[0]
            if name[i].endswith("avg") and var<gmin[v]: gmin[v]=var
            if name[i].endswith("avg") and var>gmax[v]: gmax[v]=var
            
            print(climate+"_"+name[i]+": "+str(var)+",")

    print(gmin)
    print(gmax)

def compute_vulnerabilities(db):
    table = "nfvi_sfri"
    q=f"select count(*) from {table};"
    db.cur.execute(q)
    count = db.cur.fetchone()[0]
    dec = count/10;

    for col in ["a1", "a2", "h1", "h2", "i1", "i2", "i3", "i4", "i5",
                "f1","f2", "k1", "t1", "t2", "m1", "m2", "m3", "c1", "l1", "e1", "s1",
	        "s2", "s3", "s4", "n1", "n2", "n3"]:
        print("deciles_"+col+": [")
        for d in range(1,10):
            q=f"select {col} from {table} order by {col} desc limit 1 offset {dec*d}"         
            db.cur.execute(q)
            v = db.cur.fetchone()
            print("    "+str(v[0])+",")
        print("],")

def compute_vulnerability_averages(db):
    table = "nfvi_sfri"

    for col in ["a1", "a2", "h1", "h2", "i1", "i2", "i3", "i4", "i5",
                "f1","f2", "k1", "t1", "t2", "m1", "m2", "m3", "c1", "l1", "e1", "s1",
	        "s2", "s3", "s4", "n1", "n2", "n3"]:

        q=f"select avg({col}) from {table}"         
        db.cur.execute(q)
        v = db.cur.fetchone()
        print("average_"+col+": "+str(v[0])+",")
