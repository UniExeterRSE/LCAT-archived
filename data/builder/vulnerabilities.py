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

# nfvi_sfri data is stored on lsoa, so this script transfers them
# directly to lsoa and averages them from the others

cols = ["a1", "a2", "h1", "h2", "i1", "i2", "i3", "i4", "i5",
        "f1","f2", "k1", "t1", "t2", "m1", "m2", "m3", "c1", "l1", "e1", "s1",
	"s2", "s3", "s4", "n1", "n2", "n3"]

# one to one mapping to create a lsoa or sc_dz one
def import_to_self(db,table):
    new_table = {f"{table}_vulnerabilities": [["boundary_id","int primary key"]]}
    for col in cols:
        new_table[f"{table}_vulnerabilities"].append([col,"real"])    
    db.create_tables(new_table)
    if table=="boundary_lsoa": code = "lsoa11cd"
    else: code = "datazone"        
    q=f"select gid,{code} from {table};"
    db.cur.execute(q)
    geos = db.cur.fetchall()
    for n,geo_id in enumerate(geos):        
        cols_q = ", ".join(cols)
        q=f"select {cols_q} from nfvi_sfri where code='{geo_id[1]}'";
        db.cur.execute(q)
        vulns = db.cur.fetchall()        
        vulns_str = ", ".join([str(float(v)) for v in vulns[0]])            
        cols_q = ", ".join(cols)
        q=f"insert into {table}_vulnerabilities (boundary_id,{cols_q}) values ({geo_id[0]},{vulns_str});"
        db.cur.execute(q)                
        db.conn.commit()
        print("vulnerabilities "+table+" "+str(n)+"/"+str(len(geos)))
 

# one to many mapping, averaging lsoa or sc_dzs we contain
def import_to_table(db,table):
    new_table = {f"{table}_vulnerabilities": [["boundary_id","int primary key"]]}

    for col in cols:
        new_table[f"{table}_vulnerabilities"].append([col,"real"])
    
    db.create_tables(new_table)

    q=f"select gid from {table};"
    db.cur.execute(q)
    geos = db.cur.fetchall()
    for n,geo_id in enumerate(geos):
        print("------------------------------------")
        
        # get list of lsoa names inside this geometry from the mapping
        q=f"""select gid,lsoa11cd from {table}_lsoa_mapping
              join boundary_lsoa on gid=lsoa_id
              where geo_id={geo_id[0]}"""
        db.cur.execute(q)
        lsoas = db.cur.fetchall()

        # are we in SCOTLAND?!
        if len(lsoas)==0:
            print("searching scotland")
            q=f"""select gid,datazone from {table}_sc_dz_mapping
            join boundary_sc_dz on gid=lsoa_id
            where geo_id={geo_id[0]}"""
            db.cur.execute(q)
            lsoas = db.cur.fetchall()

        if len(lsoas)>0:
            print("found")
        
            lsoa_ids = [lsoa[0] for lsoa in lsoas]
            lsoa_names = [lsoa[1] for lsoa in lsoas]
            lsoa_names_str = ", ".join(["'"+name+"'" for name in lsoa_names])
                  
            # average each vulnerability 
            cols_q = ", ".join([f"avg({col}) as "+col for col in cols])

            vulns = db.cur.fetchall()
            print(vulns)
            if len(vulns)>0:        
                vulns_str = ", ".join([str(float(v)) for v in vulns[0]])
            
                cols_q = ", ".join(cols)
                q=f"insert into {table}_vulnerabilities (boundary_id,{cols_q}) values ({geo_id[0]},{vulns_str});"
                db.cur.execute(q)                
                db.conn.commit()
                print("vulnerabilities "+table+" "+str(n)+"/"+str(len(geos)))
            else:
                print("no vulns found")
        else:
            print("no lsoas or datazones found")

# one to many mapping, averaging lsoa or sc_dzs we contain
def import_to_table_median(db,table):
    new_table = {f"{table}_vulnerabilities": [["boundary_id","int primary key"]]}

    for col in cols:
        new_table[f"{table}_vulnerabilities"].append([col,"real"])
    
    db.create_tables(new_table)

    q=f"select gid from {table};"
    db.cur.execute(q)
    geos = db.cur.fetchall()
    for n,geo_id in enumerate(geos):
        print("------------------------------------")
        
        # get list of lsoa names inside this geometry from the mapping
        q=f"""select gid,lsoa11cd from {table}_lsoa_mapping
              join boundary_lsoa on gid=lsoa_id
              where geo_id={geo_id[0]}"""
        db.cur.execute(q)
        lsoas = db.cur.fetchall()

        # are we in SCOTLAND?!
        if len(lsoas)==0:
            print("searching scotland")
            q=f"""select gid,datazone from {table}_sc_dz_mapping
            join boundary_sc_dz on gid=lsoa_id
            where geo_id={geo_id[0]}"""
            db.cur.execute(q)
            lsoas = db.cur.fetchall()

        if len(lsoas)>0:
            lsoa_ids = [lsoa[0] for lsoa in lsoas]
            lsoa_names = [lsoa[1] for lsoa in lsoas]
            lsoa_names_str = ", ".join(["'"+name+"'" for name in lsoa_names])

            print(str(len(lsoa_names))+" boundaries")
                        
            cols_q = ", ".join(cols)
            # median of each vuln (use region to only do zones lookup once for every variable)
            median_q = ", ".join([f"(select percentile_disc(0.5) within group (order by {col}) from region)" for col in cols])
            q=f"""with region as (select * from nfvi_sfri where code in ({lsoa_names_str})) 
                  insert into {table}_vulnerabilities (boundary_id,{cols_q}) values ({geo_id[0]},{median_q});"""
            db.cur.execute(q)                
            db.conn.commit()
            print("vulnerabilities "+table+" "+str(n)+"/"+str(len(geos)))            
            
        else:
            print("no lsoas or datazones found")
