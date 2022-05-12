import csv
import yaml
import psycopg2

# old climate data import

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

data_cols = {
    "future_precip":
    [["id","serial"],
     ["date","date"],
     ["daily_precip","real"],
     ["zone","int"]],

    "future_temps":
    [["id","serial"],
     ["date","date"],
     ["mean","real"],
     ["max","real"],
     ["min","real"],
     ["zone","int"]],

    "future_windspeed":
    [["id","serial"],
     ["date","date"],
     ["mean","real"],
     ["max","real"],
     ["min","real"],
     ["zone","int"]]
}

def avg_data_cols(data_type):
    ret=[]
    for col in data_cols[data_type]:
        col = col[0]
        if col not in ["id", "date", "zone"]:
            ret.append(col)
    return ret

output_avg_cols = {
    "future_precip":
    {"daily_precip":"daily_precip"},

    "future_temps":
     {"mean":"mean_temp",
      "max":"max_temp",
      "min":"min_temp"},
      
    "future_windspeed":
    {"mean":"mean_windspeed",
     "max":"max_windspeed",
     "min":"min_windspeed"}     
}

nzones = 24

def nuke_tables():
    for t,c in data_cols.items():
        cur.execute(f"delete from {t}")
        conn.commit()

def create_tables():
    for t,c in data_cols.items():
        cols = []
        for col in c:
            cols.append(f"{col[0]} {col[1]}")

        s = ", ".join(cols)
        q=f"create table {t} ({s});"
        print(q)
        cur.execute(q)
        conn.commit()

# load all data straight, a lot...
def load_data():    
    for data_type in types:
        for zone in range(1,nzones+1):
            with open(data_dir+"/"+data_type+"/"+str(zone)+"_"+data_type+".csv", newline='') as csvfile:
                reader = csv.reader(csvfile)
                for i,row in enumerate(reader):
                    if i>0:
                        arr=[]
                        for ii,d in enumerate(row):
                            if (d=="NA"): d="0"
                            arr.append("'"+d+"'")
                        arr.append("'"+str(zone)+"'")
                        s=", ".join(arr)

                        v=[]
                        for col in data_cols[data_type][1:]:
                            v.append(col[0])
                        sv=", ".join(v)
                        
                        q=f"insert into {data_type} ({sv}) values ({s});"
                        #print(q)
                        cur.execute(q)
                print(data_type+" "+str(zone))
                conn.commit()

# average daily data into yearly - much more usable
# needs:
# create table future_year_avg (zone int, year int, type varchar, value real);
def avg_data():    
    for data_type in types:
        for col in avg_data_cols(data_type):
            if col not in ["id", "date", "zone"]:
                for zone in range(1,nzones+1):
                    for year in range(2021,2099):            
                        q=f"select avg({col}) from {data_type} where zone={zone} and extract(year from date)={year}"
                        cur.execute(q)
                        r = cur.fetchone()
                        avg = r[0]
                        output_col = output_avg_cols[data_type][col]
                        
                        q=f"insert into future_year_avg (zone, year, type, value) values ('{zone}','{year}','{output_col}','{avg}')"
                        print(q)

                        cur.execute(q)
                        conn.commit()

# average daily data into winter/summer months
# needs:
# create table future_winter_avg (zone int, year int, type varchar, value real);
# create table future_summer_avg (zone int, year int, type varchar, value real);
def avg_data_seasonal():    
    for data_type in types:
        for col in avg_data_cols(data_type):
            if col not in ["id", "date", "zone"]:
                for zone in range(1,nzones+1):
                    for year in range(2021,2099):
                        for season in [["winter",["12","1","2"]],
                                       ["summer",["6","7","8"]]]:
                            season_name=season[0]
                            months=",".join(season[1])
                            q=f"select avg({col}) from {data_type} where zone={zone} and extract(year from date)={year} and extract(month from date) in ({months})"
                            cur.execute(q)
                            r = cur.fetchone()
                            avg = r[0]
                            output_col = output_avg_cols[data_type][col]
                            
                            q=f"insert into future_{season_name}_avg (zone, year, type, value) values ('{zone}','{year}','{output_col}','{avg}')"
                            print(q)
                            
                            cur.execute(q)
                            conn.commit()


                        
#create_tables()
#nuke_tables()
#avg_data()    
avg_data_seasonal()    
