
import json
import urllib.request
import xmltodict
import time
from builder import doi_lookup

# Convert network csvs into json

class network_parser:
    def __init__(self):
        self.nodes = {}
        self.edges = {}
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
                    self.nodes.append({
                        "label":row[0],
                        "type":row[1],
                        "tags":row[2],
                        "description":row[3],
                        "climate_hazard":row[4],
                        "disease_injury_wellbeing":row[5],
                        "icd11":row[6],
                        "sector":row[7],
                        "sdg":row[8]
                    })
                    # todo: references

    # connections:
    # From,To, Label, Type, Description, References, UN SDG
    def load_connections(self,fn):
        with open(fn) as csvfile:
            reader = csv.reader(csvfile)
            for i,row in enumerate(reader):
                if i>0:
                    self.edges.append({                        
                        "type": row[0],
                        "node_from_label": rowf["id"],
                        "node_to_label": t["id"],
                        })

    def pp(self,arr):
        for n,i in arr.items():
            print(n)
            for k,v in i.items():
                if v!="":
                    print(k+": "+str(v))

