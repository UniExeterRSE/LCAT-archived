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

def compute(db):
    db.create_tables({
        "stats":
        [["id","serial primary key"],
         ["key","text unique"],
         ["value","real"]]
    })
    
    tables = ["lsoa","msoa","counties"]
    
    for table in tables:        
        q=f"select avg(imdscore) from {table} where imdscore>0;"
        db.cur.execute(q)
        v = db.cur.fetchone()[0]
        print(table,v)
        if v!=None:        
            q=f"insert into stats (key, value) values ('{table}_imd_avg',{v});"
            db.cur.execute(q)
            db.conn.commit()
            
    # climatejust nfvi/sfri
    # only have em in lsoa atm
    table = "lsoa"
    q=f"select count(*) from nfvi_sfri;"
    db.cur.execute(q)
    count = db.cur.fetchone()[0]
    dec = count/10;

    for col in builder.nfvi_sfri.cols:
        print(col)
        sq=f"select avg({col}) from nfvi_sfri" 
        q=f"insert into stats (key, value) values ('{table}_{col}_avg',({sq}));"
        db.cur.execute(q)
        sq=f"select min({col}) from nfvi_sfri" 
        q=f"insert into stats (key, value) values ('{table}_{col}_min',({sq}));"
        db.cur.execute(q)
        sq=f"select max({col}) from nfvi_sfri" 
        q=f"insert into stats (key, value) values ('{table}_{col}_max',({sq}));"
        db.cur.execute(q)

        for d in range(1,10):
            sq=f"select {col} from nfvi_sfri order by {col} desc limit 1 offset {dec*d}" 
            q=f"insert into stats (key, value) values ('{table}_{col}_dec_{d}',({sq}));"
            db.cur.execute(q)

        db.conn.commit()
    
