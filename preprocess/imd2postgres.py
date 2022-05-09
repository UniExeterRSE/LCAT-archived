import csv
import yaml
import psycopg2

with open('config.yml') as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

conn = psycopg2.connect(f"host={config['host']}\
                         dbname={config['dbname']} \
                         user={config['user']} \
                         password={config['password']}")
cur = conn.cursor()

data_dir = "/home/dave/projects/climate/data/"

#ALTER TABLE lsoa ADD imdscore real;

def load_data():    
    with open(data_dir+"imd2019lsoa.csv", newline='') as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                #print(row)
                # get the IMD score only
                if row[5].startswith("a.") and row[2]=="Score":
                    lsoa_code = row[0]
                    score = row[4]                                  
                    q=f"update lsoa set imdscore='{score}' where lsoa11cd='{lsoa_code}';"
                    print(q)
                    cur.execute(q)                
                    conn.commit()
                
load_data()
