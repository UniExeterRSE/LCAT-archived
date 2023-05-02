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

    def read_node_title(self,node_id):
        self.db.cur.execute(f"select label from network_nodes where node_id={node_id}")
        
    def reset_network(self):
        self.db.cur.execute("drop table if exists networks cascade")
        q = """create table networks (network_id serial primary key, name text);"""
        self.db.cur.execute(q)

        self.db.cur.execute("drop table if exists network_node_mapping cascade")
        q = """create table network_node_mapping (id serial primary key,
               network_id int, 
               node_id text,
               x real,
               y real,
               constraint fk_network foreign key(network_id) references networks(network_id),
               constraint fk_node foreign key(node_id) references network_nodes(node_id)  
          );"""
        self.db.cur.execute(q)

        self.db.cur.execute("drop table if exists network_edge_mapping cascade")
        q = """create table network_edge_mapping (id serial primary key,
               network_id int, 
               edge_id text,
               constraint fk_network foreign key(network_id) references networks(network_id),
               constraint fk_edge foreign key(edge_id) references network_edges(edge_id)
          );"""
        self.db.cur.execute(q)

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

    def add_network(self,name):
        self.db.cur.execute("insert into networks (name) values (%s) returning network_id",(name,))
        self.db.conn.commit()
        return self.db.cur.fetchone()[0]
        
    def add_node(self,node):
        self.db.cur.execute("select node_id,label from network_nodes where node_id=%s",(node["_id"],))
        self.db.conn.commit()
        check = self.db.cur.fetchall()
        if len(check)>0:
            print(check)
            print(node)
            print("already exists...")
        else:
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
            

    def add_network_node_mapping(self,network_id,node_id,x,y):
        self.db.cur.execute("insert into network_node_mapping (network_id, node_id, x, y) values (%s,%s,%s,%s)",
                            (network_id,node_id,x,y))        
        self.db.conn.commit()
                
    def add_edge(self,edge):

        self.db.cur.execute("select edge_id,node_from,node_to from network_edges where edge_id=%s",(edge["_id"],))
        self.db.conn.commit()
        check = self.db.cur.fetchall()
        if len(check)>0:
            print(check)
            print(edge)
            print("already exists...")
        else:
            if not 'connection type' in edge['attributes']:
                #print("no connection type for edge? "+edge["_id"]+" "+edge["from"]+"->"+edge["to"])
                edge['attributes']['connection type']="?"
                #return

            #if edge['attributes']['connection type']!="+" and edge['attributes']['connection type']!="-":
            #print("wrong connection type for edge? ("+edge['attributes']['connection type']+") "+edge["_id"]+" "+edge["from"]+"->"+edge["to"])
            #return
        
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
            pass #print("no ref for edge? "+edge["_id"]+" "+edge["from"]+"->"+edge["to"])
        
    def add_network_edge_mapping(self,network_id,edge_id):
        self.db.cur.execute("insert into network_edge_mapping (network_id, edge_id) values (%s,%s)",
                            (network_id,edge_id))        
        self.db.conn.commit()                
                    
    def add_ref(self,row):
        row_id = row[0]
        row_type = row[1]
        row_doi = row[2] 
        row_orig_link = row[3] 
        row_rep_link = row[4]
        row_notes = row[5]
        row_title = row[6]

        self.db.cur.execute("select article_id,title from articles where article_id=%s",(row[0],))
        self.db.conn.commit()
        check = self.db.cur.fetchall()
        if len(check)>0:
            if check[0][1]!="ERROR" and check[0][1]!="":
                #print("already done, skipping article "+row_id)
                return
            else:
                if check[0][1]=="":
                    print(row_id+" exists, but no title, retrying...")
                else:
                    print(row_id+" exists, but network error, retrying...")
                # delete the error and try again
                self.db.cur.execute("delete from articles where article_id=%s",(row[0],))
                self.db.conn.commit()
        
        ref = False
        print(row_type)
        if row_type not in ["Report","Web Page"] and row_doi!="":
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

    def add_node_article_mapping_from_doi(self, node_id, doi):
        self.db.cur.execute("select article_id from articles where doi=%s",(doi,))
        self.db.conn.commit()
        found = self.db.cur.fetchall()
        
        if (len(found)==0):
            print("can't find node article no: "+doi+" ("+node_id+")")
            return False

        self.db.cur.execute(f"""insert into node_article_mapping (node_id, article_id) values
        ('{node_id}','{found[0][0]}')""")
        self.db.conn.commit()
        return True
    
    def add_node_article_mapping(self, node_id, article_id):
        if not article_id.isnumeric():
            return self.add_node_article_mapping_from_doi(node_id, article_id)
            
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("can't find node article no: "+article_id+" ("+node_id+")")
            return False

        self.db.cur.execute(f"""insert into node_article_mapping (node_id, article_id) values
        ('{node_id}','{article_id}')""")
        self.db.conn.commit()
        return True

    def add_edge_article_mapping_from_doi(self, edge_id, doi):
        self.db.cur.execute("select article_id from articles where doi=%s",(doi,))
        self.db.conn.commit()
        found = self.db.cur.fetchall()
        
        if (len(found)==0):
            print("can't find edge article no: "+doi+" ("+edge_id+")")
            return False

        self.db.cur.execute(f"""insert into edge_article_mapping (edge_id, article_id) values
        ('{edge_id}','{found[0][0]}')""")
        self.db.conn.commit()
        return True

    def add_edge_article_mapping(self, edge_id, article_id):
        if not article_id.isnumeric():
            return self.add_edge_article_mapping_from_doi(edge_id, article_id)
        
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("can't find edge article no: "+article_id+" ("+edge_id+")")
            return False

        self.db.cur.execute(f"""insert into edge_article_mapping (edge_id, article_id) values
        ('{edge_id}','{article_id}')""")
        self.db.conn.commit()
        return True

def reset_refs(db):
    nd = network_db(db)
    nd.reset_refs()

def reset_network(db):
    nd = network_db(db)
    nd.reset_network()
    
def find_item(l,id):
    for el in l:
        if el["_id"]==id: return el
    print(id+" not found")
    return False
    
def load(db,path):    
    nd = network_db(db)
    #nd.reset_network()
    
    net = json.load(open(path))

    # add all the nodes and edges
    for node in net["elements"]:
        nd.add_node(node)
    for edge in net["connections"]:
        nd.add_edge(edge)

    for map in net["maps"]:
        print(map["name"])
        network_id = nd.add_network(map["name"])
        for node in map["elements"]:
            nd.add_network_node_mapping(network_id,
                                        node["element"],
                                        node["position"]["x"],
                                        node["position"]["y"])
        for edge in map["connections"]:
            nd.add_network_edge_mapping(network_id,edge["connection"])
            


def load_refs(db,refssheet):                
    nd = network_db(db)
    ##nd.reset_refs()

    with open(refssheet) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                nd.add_ref(row)

        print(nd.doi_lookup.errors)


                                   

        
