import csv
import json

climate_vars = []
causes = []
factors = {}
impacts = {}
adaptations = {}
next_id=1

# elements:
# Label, Type, Tags, Description, References, DOI, UN SDG, Variables
# Tags = "climate variable"

def str2arr(s):
    ret = []
    if s!="":
        ret = s.split("|")
    return ret
        
def load_elements(fn):
    global next_id
    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                if row[1]=="Climate variable":
                    # store to build later from connections
                    climate_vars.append(row[0])
                else:                    
                    factors[row[0]]={
                        "id": next_id,
                        "short": row[0],
                        "type": row[1],
                        "long": row[2],
                        "refs": str2arr(row[3]),
                        "unsdg": row[4],
                        "impacts": []
                    }
                    next_id+=1

# connections:
# From,To, Label, Type, Description, References, UN SDG
def load_connections(fn):
    global next_id
    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                if row[0] in climate_vars:
                    t = factors[row[1]]
                    op = ""

                    var="none"
                    if row[0]=="Wind speed":
                        op="increase"
                        var="mean_windspeed"
                        
                    if row[0]=="Rain":
                        op="increase"
                        var="daily_precip"
                        
                    if row[0]=="Temperature":
                        op="increase"
                        var="mean_temp"
                        
                    causes.append({
                        "id": next_id,
                        "short": row[0],
                        "type": row[2],
                        "long": row[4],
                        "factor": t["id"],
                        "operator": op,
                        "variable": var,
                        "refs": str2arr(row[5])
                    })
                    next_id+=1
                    
                else:                
                    f = factors[row[0]]
                    t = factors[row[1]]
                    
                    f["impacts"].append(next_id)

                    impacts[next_id] = {
                        "id": next_id,
                        "from": f["id"],
                        "to": t["id"],
                        "type": row[2],
                        "long": row[3],
                        "refs": str2arr(row[4]),
                        "unsdg": row[5],
                    }
                    next_id+=1

def lookup_factors(s):
    arr = str2arr(s)
    r = []
    ignore = ["Active transport use"]
    for title in arr:
        if title in factors and not title in ignore:
            r.append(factors[title]["id"])
        else:
            #print("could not find factor: "+title)
            pass
    return r

def load_adaptations(fn):
    global next_id
    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                adaptations[next_id]={
                    "id": next_id,
                    "related": lookup_factors(row[1]),
                    "short": row[2],
                    "long": row[3],
                    "refs": str2arr(row[4]),
                    "case": row[5],
                    "caseref": row[6],
                }
                next_id+=1
                    
def pp(arr):
    for n,i in arr.items():
        print(n)
        for k,v in i.items():
            if v!="":
                print(k+": "+str(v))
              
root = "/home/dave/projects/climate/data/ceren/"

load_elements(root+"elements2.csv")
load_connections(root+"connections2.csv")
load_adaptations(root+"adaptations.csv")

fact_by_id = {}
for k,v in factors.items():
    fact_by_id[v["id"]]=v

f = open("../server/public/src/net.js", "w")
f.write("const net = ")
f.write(json.dumps({
    "causes":causes,
    "factors":fact_by_id,
    "impacts":impacts,
    "adaptations":adaptations
}))
f.write("\nexport{ net }")
f.close()

                                   

