# Development before 2024 Copyright (C) Then Try This and University of Exeter
# Development from 2024 Copyright (C) University of Exeter
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the Common Good Public License Beta 1.0 as
# published at http://www.cgpl.org
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# Common Good Public License Beta 1.0 for more details.

# This script imports climate predictions downloaded from the
# http://uk-cri.org climate risk indicators, these are based on the
# MET Office HADGEM RCP85 model. They are 12km gridded model
# predictions, and include other higher level risk indicators we might
# be able to make use of in future.

# We import a grid as GEOJSON geometry and the model data each into
# their own tables indexed by grid cell id

import csv
import geojson
import psycopg2
from shapely.geometry import shape, Point

# Insert IMD scores into each lsoa zone GEOJSON where the name matches
# (We need the lsoa zones present to do this)


def prepare_col(db, table):
    q = "alter table " + table + " add column if not exists imd_rank real default 0;"
    db.cur.execute(q)
    db.conn.commit()
    q = "alter table " + table + " add column if not exists imd_decile real default 0;"
    db.cur.execute(q)
    db.conn.commit()


# based on the supplied csv
def load_self_lsoa(db, table, fn):
    prepare_col(db, table + "_vulnerabilities")
    with open(fn, newline="") as csvfile:
        reader = csv.reader(csvfile)
        for i, row in enumerate(reader):
            if i > 0:
                if row[5].startswith("a."):
                    lsoa_code = row[0]
                    db.cur.execute(f"select gid from {table} where lsoa11cd='{lsoa_code}'")
                    lsoa_id = db.cur.fetchone()[0]
                    value = row[4]
                    if row[2] == "Decile ":
                        q = f"update {table}_vulnerabilities set imd_decile='{value}' where boundary_id='{lsoa_id}';"
                        print(q)
                        db.cur.execute(q)
                        db.conn.commit()
                    if row[2] == "Rank":
                        q = f"update {table}_vulnerabilities set imd_rank='{value}' where boundary_id='{lsoa_id}';"
                        print(q)
                        db.cur.execute(q)
                        db.conn.commit()


# based on the supplied csv for wales
def load_self_lsoa_wimd(db, table, fn):
    prepare_col(db, table + "_vulnerabilities")
    with open(fn, newline="") as csvfile:
        reader = csv.reader(csvfile)
        for i, row in enumerate(reader):
            if i > 0:
                lsoa_code = row[3]
                print(lsoa_code)
                db.cur.execute(f"select gid from {table} where lsoa11cd='{lsoa_code}'")
                dz_id = db.cur.fetchone()[0]
                q = f"update {table}_vulnerabilities set imd_decile='{row[5]}', imd_rank='{row[4]}' where boundary_id='{dz_id}';"
                print(q)
                db.cur.execute(q)
                db.conn.commit()


# a different csv format
def load_self_sc_dz(db, table, fn):
    # add the column to the lsoa GEOJSON
    prepare_col(db, table + "_vulnerabilities")
    with open(fn, newline="") as csvfile:
        reader = csv.reader(csvfile)
        for i, row in enumerate(reader):
            if i > 0:
                dz_code = row[0]
                print(dz_code)
                db.cur.execute(f"select gid from {table} where datazone='{dz_code}'")
                dz_id = db.cur.fetchone()[0]
                q = f"update {table}_vulnerabilities set imd_decile='{row[8]}', imd_rank='{row[5]}' where boundary_id='{dz_id}';"
                print(q)
                db.cur.execute(q)
                db.conn.commit()


cols = ["imd_rank", "imd_decile"]


# one to many mapping, averaging lsoa or sc_dzs we contain
def import_to_table(db, table):
    prepare_col(db, table + "_vulnerabilities")

    q = f"select gid from {table};"
    db.cur.execute(q)
    geos = db.cur.fetchall()
    for n, geo_id in enumerate(geos):
        # get list of lsoa names inside this geometry from the mapping
        q = f"select lsoa_id from {table}_lsoa_mapping where geo_id={geo_id[0]}"
        db.cur.execute(q)
        lsoas = db.cur.fetchall()
        source_table = "boundary_lsoa_vulnerabilities"

        # are we in SCOTLAND?!
        if len(lsoas) == 0:
            print("searching scotland")
            q = f"select lsoa_id from {table}_sc_dz_mapping where geo_id={geo_id[0]}"
            db.cur.execute(q)
            lsoas = db.cur.fetchall()
            source_table = "boundary_sc_dz_vulnerabilities"

        if len(lsoas) > 0:
            lsoa_ids_str = ", ".join([str(lsoa[0]) for lsoa in lsoas])

            # average each vulnerability
            q = f"select avg(imd_rank), avg(imd_decile) from {source_table} where boundary_id in ({lsoa_ids_str})"
            db.cur.execute(q)
            vulns = db.cur.fetchall()
            vulns = vulns[0]

            if len(vulns) > 0:
                q = f"update {table}_vulnerabilities set imd_rank='{vulns[0]}', imd_decile='{vulns[1]}' where boundary_id={geo_id[0]}"
                db.cur.execute(q)
                db.conn.commit()
                print("vulnerabilities " + table + " " + str(n) + "/" + str(len(geos)))
            else:
                print("no vulns found")
        else:
            print("no lsoas or datazones found")
