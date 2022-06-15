
import csv
import json
import urllib.request
import xmltodict
import time
from builder import doi_lookup
import re

# Convert network csvs into json

def esc(s):
    return s.replace("'", r"''")

class network_parser:
    def __init__(self,ndb):
        self.climate_vars = []
        self.factors = {} # need to store factor nodes to look them up
        self.adaptations = {}
        self.next_id=1
        self.doi_lookup = doi_lookup.doi_lookup()
        self.ndb = ndb
        
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
                        n_id=self.ndb.add_node({
                            "title": esc(row[0]),
                            "type": row[1],
                            # row[2], (long???)
                            "description": esc(row[3]),
                            "unsdg": esc(row[5]),
                        })
                        self.factors[row[0]]=n_id
                        for ref in self.refs2info(self.str2arr(row[4])):
                            ref_id = self.ndb.add_article(ref)
                            self.ndb.add_node_article_mapping(n_id,ref_id)

    # connections:
    # From,To, Label, Type, Description, Articles, UN SDG
    def load_connections(self,fn):
        with open(fn) as csvfile:
            reader = csv.reader(csvfile)
            for i,row in enumerate(reader):
                if i>0:
                    e_id = 0
                    if row[0] in self.climate_vars:
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
                        
                        e_id=self.ndb.add_edge({
                            "type": esc(row[0]),
                            "description": esc(row[3]),
                            "operator": op,
                            "variable": var,
                            "direction": row[2],
                            "unsdg": esc(row[5]),
                            # no node_from for a climate causation
                            "node_to": self.factors[row[1]],
                        })
                    else:                
                        e_id=self.ndb.add_edge({
                            "type": row[2],
                            "description": esc(row[3]),
                            "operator": "",
                            "variable": "",
                            "direction": row[2],
                            "unsdg": esc(row[5]),
                            "node_from": self.factors[row[0]],
                            "node_to": self.factors[row[1]],                            
                        })
                        
                    for ref in self.refs2info(self.str2arr(row[4])):
                        ref_id = self.ndb.add_article(ref)
                        self.ndb.add_edge_article_mapping(e_id,ref_id)



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

