import csv
import json
import urllib.request
import xmltodict
import time

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

doicache = {}

def doi2info(doi):
    if doi in doicache:
        return doicache[doi]

    if doi.startswith("http"):
        doicache[doi] = { 
            "doi": doi,
            "type": "link",
            "link": doi
        }
        return doicache[doi]
    
    opener = urllib.request.build_opener()
    opener.addheaders = [('Accept', 'application/vnd.crossref.unixsd+xml')]
    while True: 
        #try:
            r = opener.open('http://dx.doi.org/'+doi)
            d = xmltodict.parse(r.read())
            journal = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]
            article = journal["journal_article"]
            #print (json.dumps(journal, indent=4))

            #print(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]["journal_article"])
            title = article["titles"]["title"]

            authors = []
            for contributor in article["contributors"]["person_name"]:
                if contributor["@contributor_role"]=="author":
                    authors.append(contributor["given_name"]+" "+contributor["surname"])

            date = ""
            if isinstance(article["publication_date"], list):
                for d in article["publication_date"]:
                    if d["@media_type"]=="print":
                        date = d["year"]
            else:
                date=article["publication_date"]["year"]
                
            journal_title = journal["journal_metadata"]["full_title"]
            #print(journal["journal_issue"])

            issue=""
            if "journal_issue" in journal:
                if "issue" in journal["journal_issue"]:
                    issue = journal["journal_issue"]["issue"]
                      
            doicache[doi]={
                "type": "article",
                "doi": doi,
                "title": title,
                "authors": authors,
                "date": date,
                "journal": journal_title,
                "issue": issue
            }

            return doicache[doi]

        
        
        #except:
        #    print("retry...")
        #    time.sleep(1)
            
    
    
def refs2info(arr):
    ret = []
    for a in arr:
        ret.append(doi2info(a))
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
                        "refs": refs2info(str2arr(row[3])),
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
                        "long": row[3],
                        "factor": t["id"],
                        "operator": op,
                        "variable": var,
                        "refs": refs2info(str2arr(row[4])),
                        "unsdg": row[5],
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
                        "refs": refs2info(str2arr(row[4])),
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
                variable = ""
                direction = ""
                if row[0] == "Increased rain":
                    variable = "daily_precip"
                    direction = "increase"
                if row[0] == "Increased wind":
                    variable = "mean_windspeed"
                    direction = "increase"
                if row[0] == "Increased temperature":
                    variable = "mean_temp"
                    direction = "increase"

                if variable=="" or direction=="":
                    print("problem with "+row[2])
                    
                adaptations[next_id]={
                    "id": next_id,
                    "variable": variable,
                    "direction": direction,
                    "related": lookup_factors(row[1]),
                    "short": row[2],
                    "long": row[3],
                    "refs": refs2info(str2arr(row[4])),
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

def go():
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

                                   
go()

for doi in doicache.keys():
    p = doicache[doi]
    if p["type"]=="link":
        print(doi)
    else:
        print(doicache[doi]["title"]+" http://doi.org/"+doi)
