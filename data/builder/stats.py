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

    
