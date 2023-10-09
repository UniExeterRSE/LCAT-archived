
import json
import urllib.request
import xmltodict
import time
import csv
from builder import doi_lookup

# Convert network csvs into json

class network_parser:
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.refs = []
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
                # strip out key nodes (maybe these have gone now?)
                if i>0 and not row[0] in ["Driver","Pressure","State","Effect","Exposure","Action"]:
                    self.nodes.append({
                        "label":row[0],
                        "type":row[1],
                        "tags":row[2],
                        "description":row[3],
                        "climate_hazard":row[4],
                        "disease_injury_wellbeing":row[5],
                        "icd11":row[6],
                        "ref_ids":row[7],
                        "sector":row[8],
                        "sdg":row[9],
                        "urban_rural":row[10],
                        "vulnerabilities":row[11]
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
                        "type": row[3],
                        "node_from_label": row[0],
                        "node_to_label": row[1],
                        })

    def load_references(self,fn):
        with open(fn) as csvfile:
            reader = csv.reader(csvfile)
            for i,row in enumerate(reader):
                if i>0:
                    doi = row[2]
                    reftype = row[1]
                    print(reftype)
                    if reftype not in ["Report","Webpage"] and doi!="":
                        print(doi)
                        info = self.doi_lookup.doi2info(doi)
                        print(info)

                        self.refs.append({
                            "ref_id": row[0],
                            "ref_type": row[1],
                            "doi": row[2],
                            "url": row[3],
                            "title": info["title"],
                            "authors": info["authors"],
                            "date": info["date"],                        
                            "journal": info["journal"],
                            "issue": info["issue"]
                        })
                    else:
                        self.refs.append({
                            "ref_id": row[0],
                            "ref_type": row[1],
                            "doi": row[2],
                            "url": row[3],
                        })
                        
    
    def pp(self,arr):
        for n,i in arr.items():
            print(n)
            for k,v in i.items():
                if v!="":
                    print(k+": "+str(v))

