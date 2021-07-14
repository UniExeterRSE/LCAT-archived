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

data_dir = "/home/dave/projects/climate/data/climate_data"

types = ["future_precip",
         "future_temps",
         "future_windspeed"]

nzones = 24

for data_type in types:
    for zone in range(1,nzones+1):
        with open(data_dir+"/"+data_type+"/"+str(zone)+"_"+data_type+".csv", newline='') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                print(', '.join(row))
