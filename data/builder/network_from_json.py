import psycopg2
import csv
import json
import urllib.request
import xmltodict
import time
from builder import doi_lookup
from builder import network_parser

# Create and modify networks

def list_to_str(l):
    ret = ""
    for i in l:
        ret+=i+", "
    return ret[:-2]
        
def sg(el,key):
    if key not in el:
        return ""
    else:
        v = el[key]
        if isinstance(v,list):
            if len(v)==1:
                return v[0]
            return list_to_str(v)
        return v

class network_db:
    def __init__(self,db):
        self.db = db
        self.doi_lookup = doi_lookup.doi_lookup()

    def reset_network(self):
        self.db.cur.execute("drop table if exists network_nodes cascade")
        q = """create table network_nodes (node_id text primary key,
        label text,
        type text,
        tags text,
        description text,
        climate_hazard text,
        disease_injury_wellbeing text,
        icd11 text,
        sector text,
        sdg text,
        urban_rural text,
        vulnerabilities text);"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists network_edges cascade")
        q = """create table network_edges (edge_id text primary key, 
        type text,
        node_from text, 
        node_to text,
        constraint fk_from foreign key(node_from) references network_nodes(node_id),  
        constraint fk_to foreign key(node_to) references network_nodes(node_id));"""
        self.db.cur.execute(q)

    def reset_refs(self):        
        self.db.cur.execute("drop table if exists articles cascade")
        q = """create table articles (article_id int primary key, 
        doi text,
        type text,
        link text,                            
        title text,
        authors text,
        date text,
        journal text,
        issue text,
        notes text)"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists node_article_mapping cascade")
        q = """create table node_article_mapping (id serial primary key, 
        node_id text,
        article_id int,
        constraint fk_node foreign key(node_id) references network_nodes(node_id),  
        constraint fk_article foreign key(article_id) references articles(article_id));"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists edge_article_mapping cascade")
        q = """create table edge_article_mapping (id serial primary key, 
        edge_id text,
        article_id int,
        constraint fk_edge foreign key(edge_id) references network_edges(edge_id),  
        constraint fk_article foreign key(article_id) references articles(article_id))"""
        self.db.cur.execute(q)

        self.db.conn.commit()

    def add_node(self,node):
        self.db.cur.execute("insert into network_nodes (node_id, label, type, tags, description, climate_hazard, disease_injury_wellbeing, icd11, sector, sdg, urban_rural, vulnerabilities) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) returning node_id",
                            (node["_id"],
                             sg(node["attributes"],"label"),
                             sg(node["attributes"],"element type"),
                             sg(node["attributes"],"tags"),
                             sg(node["attributes"],"description"),
                             sg(node["attributes"],"climate_hazard"),
                             sg(node["attributes"],"disease_injury_wellbeing"),
                             sg(node["attributes"],"icd-11_code"),
                             sg(node["attributes"],"sector"),
                             sg(node["attributes"],"un_sdg"),
                             sg(node["attributes"],"urban_rural"),
                             sg(node["attributes"],"vulnerability")))
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]

    def add_edge(self,edge):
        # match nodes by label
        self.db.cur.execute(
            "insert into network_edges (edge_id, type, node_from, node_to) values (%s, %s, %s, %s)",
            (edge['_id'],
             edge['attributes']['connection type'],
             edge['from'],
             edge['to']))
        
        self.db.conn.commit()
        return edge['_id']
                    
    def add_ref(self,row):
        print("add_article")

        ref = False
        if row[2]!="":
            ref = self.doi_lookup.doi2info(row[2],row[1])

        print(row)
            
        if ref!=False:
            self.db.cur.execute("insert into articles (article_id, doi, type, link, title, authors, date, journal, issue, notes) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (row[0],
             ref["doi"],
             ref["type"],
             row[3],
             ref["title"],
             ref["authors"],
             ref["date"],
             ref["journal"],
             ref["issue"],
             row[5]))        
        else:
            self.db.cur.execute("insert into articles (article_id, doi, type, link, notes) values (%s, %s, %s, %s, %s)",
            (row[0],
             row[2],
             row[1],
             row[3],
             row[5]))
        self.db.conn.commit()
        return row[0]

    def add_node_article_mapping(self, node_id, article_id):
        self.db.cur.execute(f"""insert into node_article_mapping (node_id, article_id) values
        ('{node_id}','{article_id}') returning id""")
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]

    def add_edge_article_mapping(self, edge_id, article_id):
        self.db.cur.execute(f"""insert into edge_article_mapping (edge_id, article_id) values
        ('{edge_id}','{article_id}') returning id""")
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]
            

def find_item(l,id):
    for el in l:
        if el["_id"]==id: return el
    print(id+" not found")
    return False
    
def load(db,path,mapname):    
    nd = network_db(db)
    nd.reset_network()
    
    net = json.load(open(path))

    for map in net["maps"]:
        if map["name"]==mapname:    
            for node in map["elements"]:
                nd.add_node(find_item(net["elements"],node["element"]))
            for edge in map["connections"]:
                nd.add_edge(find_item(net["connections"],edge["connection"]))

def load_refs(db,refssheet):                
    nd = network_db(db)
    nd.reset_refs()
 
    with open(refssheet) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                nd.add_ref(row)
                
 

                                   

        
