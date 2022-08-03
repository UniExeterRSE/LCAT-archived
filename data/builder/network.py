import psycopg2
import csv
import json
import urllib.request
import xmltodict
import time
from builder import doi_lookup
from builder import network_parser

# Create and modify networks

class network_db:
    def __init__(self,db):
        self.db = db

    def reset(self):
        self.db.cur.execute("drop table if exists network_nodes cascade")
        q = """create table network_nodes (node_id serial primary key,
        label text,
        type text,
        tags text,
        description text,
        climate_hazard text,
        disease_injury_wellbeing text,
        icd11 text,
        sector text,
        sdg text,
        vulnerability_inequality text);"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists network_edges cascade")
        q = """create table network_edges (edge_id serial primary key, 
        type text,
        node_from integer, 
        node_to integer,
        constraint fk_from foreign key(node_from) references network_nodes(node_id),  
        constraint fk_to foreign key(node_to) references network_nodes(node_id));"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists articles cascade")
        q = """create table articles (article_id serial primary key, 
        doi text,
        type text,
        link text,                            
        title text,
        authors text,
        date text,
        journal text,
        issue text)"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists node_article_mapping cascade")
        q = """create table node_article_mapping (id serial primary key, 
        node_id int,
        article_id int,
        constraint fk_node foreign key(node_id) references network_nodes(node_id),  
        constraint fk_article foreign key(article_id) references articles(article_id));"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists edge_article_mapping cascade")
        q = """create table edge_article_mapping (id serial primary key, 
        edge_id int,
        article_id int,
        constraint fk_edge foreign key(edge_id) references network_edges(edge_id),  
        constraint fk_article foreign key(article_id) references articles(article_id))"""
        self.db.cur.execute(q)

        self.db.conn.commit()
        
    def add_node(self,node):
        print(node)
        self.db.cur.execute(f"""insert into network_nodes (label, type, tags, description, climate_hazard, disease_injury_wellbeing, icd11, sector, sdg) values
        ('{node["label"]}',
        '{node["type"]}',
        '{node["tags"]}',
        '{node["description"]}',
        '{node["climate_hazard"]}',
        '{node["disease_injury_wellbeing"]}',
        '{node["icd11"]}',
        '{node["sector"]}',
        '{node["sdg"]}') returning node_id""")
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]

    def add_edge(self,edge):
        # match nodes by label
        self.db.cur.execute(f"select node_id from network_nodes where label='{edge['node_from_label']}'")
        r = self.db.cur.fetchone()
        if r==None: return False;        
        node_from_id = r[0]
        self.db.cur.execute(f"select node_id from network_nodes where label='{edge['node_to_label']}'")
        r = self.db.cur.fetchone()
        if r==None: return False;        
        node_to_id = r[0]
        
        self.db.cur.execute(f"""insert into network_edges (type, node_from, node_to) values
        ('{edge["type"]}',
        '{node_from_id}',
        '{node_to_id}') returning edge_id""")
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]
                    
    def add_article(self,ref):
        print("add_article")
        print(ref)
        ## check if it exists already
        self.db.cur.execute(f"select article_id from articles where doi='{ref['doi']}'")
        res = self.db.cur.fetchall()
        if len(res)!=0:
            return res[0][0]
        
        if ref['type']=="article":
            self.db.cur.execute(f"""insert into articles (doi, type, link, title, authors, date, journal, issue) values
            ('{ref["doi"]}',
            '{ref["type"]}',
            '{ref["link"]}',
            '{ref["title"]}',
            '{ref["authors"]}',
            '{ref["date"]}',
            '{ref["journal"]}',
            '{ref["issue"]}') returning article_id""")        
        else:
            self.db.cur.execute(f"""insert into articles (doi, type, link) values
            ('{ref["doi"]}',
            '{ref["type"]}',
            '{ref["link"]}') returning article_id""")
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]

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
            

def reset(db):
    nd = network_db(db)
    nd.reset()

def load(db,path):
    nd = network_db(db)
    np = network_parser.network_parser()
    np.load_elements(path+"elements.csv")
    np.load_connections(path+"connections.csv")
    for node in np.nodes: nd.add_node(node)
    for edge in np.edges: nd.add_edge(edge)
    

 

                                   

        
