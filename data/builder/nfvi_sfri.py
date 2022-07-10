
# nfvi_sfri data is stored on lsoa, so this script transfers them
# directly to lsoa and averages them from the others

# we want to bake these values into the main geojsons so they are
# optimised for reading

from shapely.geometry import shape, Point

cols = ["nvfi",	"nvfi_sus", "nvfi_prp", "nvfi_res", "nvfi_rec", "nvfi_com",
	"age", "health", "income", "info", "loc_know", "tenure", "mobility",
	"crime", "house_typ", "flood_exp", "service", "soc_net",
        "a1", "a2", "h1", "h2", "i1", "i2", "i3", "i4", "i5", "f1",
	"f2", "k1", "t1", "t2", "m1", "m2", "m3", "c1", "l1", "e1", "s1",
	"s2", "s3", "s4", "n1", "n2", "n3"]


def prepare_cols(db,table,cols):
    for col in cols:
        q=f'alter table {table} add column if not exists {col} real default 0;'
        db.cur.execute(q)
    db.conn.commit()

def import_to_lsoa(db):
    prepare_cols(db,"lsoa",cols)    
    q=f"select lsoa11cd from lsoa;"
    db.cur.execute(q)
    lsoa_codes = db.cur.fetchall()

    cols_q = ", ".join(cols)
    
    for lsoa_code in lsoa_codes:
        q=f"select {cols_q} from nfvi_sfri where code = '{lsoa_code[0]}'"
        db.cur.execute(q)
        vals = db.cur.fetchall()[0]
        for idx,col in enumerate(cols):
            q=f"update lsoa set {col}='{float(vals[idx])}' where lsoa11cd='{lsoa_code[0]}'";
            db.cur.execute(q)
        print(lsoa_code)
        db.conn.commit()


def lsoa_to_msoa(db):
    prepare_cols(db,"msoa",cols)

    print("loading lsoa geom")
    # load lsoa geom
    q=f"select gid,ST_AsGeoJSON(ST_Transform(geom,4326))::json from lsoa limit 100;"
    db.cur.execute(q)
    lsoas = db.cur.fetchall()
    
    # for each msoa
    q=f"select gid from msoa;"
    db.cur.execute(q)
    for geo_id in db.cur.fetchall():
        q=f"select ST_AsGeoJSON(ST_Transform(geom,4326))::json from msoa where gid={geo_id[0]}"
        db.cur.execute(q)
        geo = db.cur.fetchone()[0]
        intersect = []
        for lsoa in lsoas:
            if shape(lsoa[1]).intersects(shape(geo)):
                intersect.append(lsoa[0])

            if len(intersect)>0:
                # find averages for the regions we contain
                cols_avg=[]
                for col in cols:
                    cols_avg.append("avg("+col+")")
                    cols_q=", ".join(cols_avg)

                    q=f"select {cols_q} where gid in ({', '.join(intersect)})";
                    db.cur.execute(q)
                    avgs = db.cur.fetchall()

                    # update the msoa with these values
                    sets = []
                    for idx,col in enumerate(cols):
                        sets.append(col+"="+avgs[idx])
            
                    q=f"update msoas set {', '.joim(sets)} where gid='{geo_id[0]}';"
                    print(q)
                    db.cur.execute(q)                
                    db.conn.commit()        
            else:
                print(str(geo_id)+" is empty")

def import_to_regions(db):
    pass
