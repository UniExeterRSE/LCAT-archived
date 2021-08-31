import csv
import json

climate_vars = []
causes = []
factors = {}
impacts = {}
adaptations = []
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
                if row[2]=="climate variable":
                    # store to build later from connections
                    climate_vars.append(row[0])
                else:                    
                    factors[row[0]]={
                        "id": next_id,
                        "short": row[0],
                        "type": row[1],
                        "tags": row[2],
                        "long": row[3],
                        "references": str2arr(row[4]),
                        "unsdg": row[5],
                        "variables": str2arr(row[6]),
                        "impacts": []
                    }
                    next_id+=1

# connections:
# From,To, Label, Type, Tags, Description, References, DOI, UN SDG, Variables
def load_connections(fn):
    global next_id
    with open(fn) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                if row[0] in climate_vars:
                    t = factors[row[1]]
                    op = ""
                    if row[3]=="+": op="increase"
                    else: op="decrease"
                        
                    causes.append({
                        "id": next_id,
                        "short": row[0],
                        "long": row[5],
                        "factor": t["id"],
                        "operator": op, 
                        "ref": str2arr(row[6])
                    })
                    next_id+=1
                    
                else:                
                    f = factors[row[0]]
                    t = factors[row[1]]
                    
                    f["impacts"].append(next_id)

                    print(str2arr(row[6]))
                    
                    impacts[next_id] = {
                        "id": next_id,
                        "from": f["id"],
                        "to": t["id"],
                        "short": row[2],
                        "type": row[3],
                        "tags": row[4],
                        "long": row[5],
                        "refs": str2arr(row[6]),
                        "unsdg": row[7],
                        "vars": str2arr(row[8])
                    }
                    next_id+=1
                
                    
def pp(arr):
    for n,i in arr.items():
        print(n)
        for k,v in i.items():
            if v!="":
                print(k+": "+str(v))
              
root = "/home/dave/projects/climate/data/ceren/"

load_elements(root+"elements.csv")
load_connections(root+"connections.csv")

fact_by_id = {}
for k,v in factors.items():
    fact_by_id[v["id"]]=v

f = open("../server/public/src/net.js", "w")
f.write("const net = ")
f.write(json.dumps({
    "causes":causes,
    "factors":fact_by_id,
    "impacts":impacts
}))
f.write("\nexport{ net }")
f.close()

                                   

