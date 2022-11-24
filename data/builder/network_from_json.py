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

        if "reference_id" in node["attributes"]:
            found = 0
            for ref in node["attributes"]["reference_id"]:
                if self.add_node_article_mapping(node["_id"], ref):
                    found+=1
            if found!=len(node["attributes"]["reference_id"]):
                print(str(found)+"/"+str(len(node["attributes"]["reference_id"])))
            

    def add_edge(self,edge):
        # match nodes by label
        self.db.cur.execute(
            "insert into network_edges (edge_id, type, node_from, node_to) values (%s, %s, %s, %s)",
            (edge['_id'],
             edge['attributes']['connection type'],
             edge['from'],
             edge['to']))
        
        self.db.conn.commit()

        if "reference_id" in edge["attributes"]:
            found = 0
            for ref in edge["attributes"]["reference_id"]:
                if self.add_edge_article_mapping(edge["_id"], ref):
                    found+=1
            if found!=len(edge["attributes"]["reference_id"]):
                print(str(found)+"/"+str(len(edge["attributes"]["reference_id"])))
        else:
            print("no ref for edge? "+edge["_id"]+" "+edge["from"]+"->"+edge["to"])
        
                    
    def add_ref(self,row):
        row_id = row[0]
        row_type = row[1]
        row_doi = row[2] 
        row_orig_link = row[3] 
        row_rep_link = row[4]
        row_title = row[5]

        self.db.cur.execute("select article_id from articles where article_id=%s",(row[0],))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())>0):
            print("already done, skipping article "+row_id)
            return

        print(row)
        
        ref = False
        if row_doi!="":
            ref = self.doi_lookup.doi2info(row_doi,row_type)

        link=row_orig_link
        if row_rep_link!="": link=row_rep_link
            
        if ref!=False:
            self.db.cur.execute("insert into articles (article_id, doi, type, link, title, authors, date, journal, issue) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (row_id,
             ref["doi"],
             row_type,
             link,
             ref["title"],
             ref["authors"],
             ref["date"],
             ref["journal"],
             ref["issue"]))        
        else:
            self.db.cur.execute("insert into articles (article_id, title, doi, type, link) values (%s, %s, %s, %s, %s)",
            (row_id,
             row_title,
             row_orig_link, # save original link as doi
             row_type,
             link))
        self.db.conn.commit()
        return row_id

    def add_node_article_mapping(self, node_id, article_id):
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("can't find node article no: "+article_id+" ("+node_id+")")
            return False

        self.db.cur.execute(f"""insert into node_article_mapping (node_id, article_id) values
        ('{node_id}','{article_id}')""")
        self.db.conn.commit()
        return True


    def add_edge_article_mapping(self, edge_id, article_id):
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("can't find edge article no: "+article_id+" ("+edge_id+")")
            return False

        self.db.cur.execute(f"""insert into edge_article_mapping (edge_id, article_id) values
        ('{edge_id}','{article_id}')""")
        self.db.conn.commit()
        return True

def reset(db):
    nd = network_db(db)
    #nd.reset_refs()
    
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

# 7   doi.org 404
# 165 doi.org 404
# 212 doi.org error
# 235 doi.org timeout

# 146 is a Journal Article (csv fix) OK


# missing articles
#can't find edge article no: 119 (conn-H4EXWpEO)
#0/1
#can't find edge article no: 94 (conn-dvyTdIOG)
#0/1
#can't find edge article no: 138 (conn-TOOR7ysY)
#can't find edge article no: 139 (conn-TOOR7ysY)
#0/2

def load_refs(db,refssheet):                
    nd = network_db(db)
    ##nd.reset_refs()
 
    with open(refssheet) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0 and not row[0] in ["7", "165","212", "235", ""]:
                nd.add_ref(row)
                
    for broken_id in ["7", "165","212", "235"]:
        nd.add_ref([broken_id,"fixme_type","","fixme_org_link","fixme_rep_link","fixme_title"])
                                   

        
