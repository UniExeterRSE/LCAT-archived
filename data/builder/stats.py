






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
    
    
