
import json
import urllib.request
import xmltodict
import time
from builder import doi_lookup

# Convert network csvs into json

class network_parser:
    def __init__(self):
        self.climate_vars = []
        self.causes = []
        self.factors = {}
        self.impacts = {}
        self.adaptations = {}
        self.next_id=1
        self.doi_lookup = doi_lookup.doi_lookup()

    def str2arr(self,s):
        ret = []
        if s!="":
            ret = s.split("|")
        return ret
                    
    def refs2info(self,arr):
        ret = []
        for a in arr:
            ret.append(self.doi_lookup.doi2info(a))
        return ret
    
    def load_elements(self,fn):
        with open(fn) as csvfile:
            reader = csv.reader(csvfile)
            for i,row in enumerate(reader):
                if i>0:
                    if row[1]=="Climate variable":
                        # store to build later from connections
                        self.climate_vars.append(row[0])
                    else:                    
                        self.factors[row[0]]={
                            "id": self.next_id,
                            "short": row[0],
                            "type": row[1],
                            "overview": row[2],
                            "long": row[3],
                            "refs": self.refs2info(self.str2arr(row[4])),
                            "unsdg": row[5],
                            "impacts": []                            
                        }
                        self.next_id+=1

    # connections:
    # From,To, Label, Type, Description, References, UN SDG
    def load_connections(self,fn):
        with open(fn) as csvfile:
            reader = csv.reader(csvfile)
            for i,row in enumerate(reader):
                if i>0:
                    if row[0] in self.climate_vars:
                        t = self.factors[row[1]]
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
                        
                        self.causes.append({
                            "id": self.next_id,
                            "short": row[0],
                            "type": row[2],
                            "long": row[3],
                            "factor": t["id"],
                            "operator": op,
                            "variable": var,
                            "refs": self.refs2info(self.str2arr(row[4])),
                            "unsdg": row[5],
                        })
                        self.next_id+=1                    
                    else:                
                        f = self.factors[row[0]]
                        t = self.factors[row[1]]
                    
                        f["impacts"].append(self.next_id)

                        self.impacts[self.next_id] = {
                            "id": self.next_id,
                            "from": f["id"],
                            "to": t["id"],
                            "type": row[2],
                            "long": row[3],
                            "refs": self.refs2info(self.str2arr(row[4])),
                            "unsdg": row[5],
                        }
                        self.next_id+=1

    def lookup_factors(self,s):
        arr = self.str2arr(s)
        r = []
        ignore = ["Active transport use"]
        for title in arr:
            if title in self.factors and not title in ignore:
                r.append(self.factors[title]["id"])
            else:
                #print("could not find factor: "+title)
                pass
        return r

    def load_adaptations(self,fn):
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
                    
                    self.adaptations[self.next_id]={
                        "id": self.next_id,
                        "variable": variable,
                        "direction": direction,
                        "related": self.lookup_factors(row[1]),
                        "short": row[2],
                        "long": row[3],
                        "refs": self.refs2info(self.str2arr(row[4])),
                        "case": row[5],
                        "caseref": row[6],
                    }
                    self.next_id+=1
                    
    def pp(self,arr):
        for n,i in arr.items():
            print(n)
            for k,v in i.items():
                if v!="":
                    print(k+": "+str(v))

