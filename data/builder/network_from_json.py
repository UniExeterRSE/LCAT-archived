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

all_hazards = ['Temperature', 'Sea level rise', 'Coastal', 'Flooding', 'Drought', 'Extreme storms', 'Coastal erosion']

def check_node_attributes(attrib):
    if attrib["element type"]=="Action":
        hazards = attrib["climate_hazard"]
        if len(hazards)==0:
            print("no hazards")
        else:
            for hazard in hazards:
                if hazard not in all_hazards:
                    print(hazard+" not expected")

class network_db:
    def __init__(self,db):
        self.db = db
        self.doi_lookup = doi_lookup.doi_lookup()

    def get_node_title(self,node_id):
        self.db.cur.execute(f"select label from network_nodes where node_id='{node_id}'")
        self.db.conn.commit()
        s = self.db.cur.fetchall()
        if len(s)>0:
            return s[0][0] 

    def get_edge_titles(self,edge_id):
        self.db.cur.execute(f"select node_from,node_to from network_edges where edge_id='{edge_id}'")
        self.db.conn.commit()
        s = self.db.cur.fetchall()
        if len(s)>0:
            return self.get_node_title(s[0][0])+" -> "+self.get_node_title(s[0][1])
        
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
        vulnerabilities text,
        main_impact text);"""
        self.db.cur.execute(q)
        
        self.db.cur.execute("drop table if exists network_edges cascade")
        q = """create table network_edges (edge_id text primary key, 
        type text,
        node_from text, 
        node_to text,
        constraint fk_from foreign key(node_from) references network_nodes(node_id),  
        constraint fk_to foreign key(node_to) references network_nodes(node_id));"""
        self.db.cur.execute(q)

        
        self.db.cur.execute("drop table if exists networks cascade")
        q = """create table networks (network_id serial primary key, name text);"""
        self.db.cur.execute(q)

        self.db.cur.execute("drop table if exists network_node_layers cascade")
        q = """create table network_node_layers (id serial primary key, node_id text, layer_name text,
               constraint fk_node foreign key(node_id) references network_nodes(node_id)
               );"""
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
            return #print("already exists...")
        else:
            #print(node["attributes"])
            #check_node_attributes(node["attributes"])            
            self.db.cur.execute("insert into network_nodes (node_id, label, type, tags, description, climate_hazard, disease_injury_wellbeing, icd11, sector, sdg, urban_rural, vulnerabilities, main_impact) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) returning node_id",
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
                                 sg(node["attributes"],"vulnerability"),
                                 sg(node["attributes"],"main impact")))
            
            self.db.conn.commit()

        if "layer" in node["attributes"]:
            for layer in node["attributes"]["layer"]:
                self.add_node_layer(node["_id"],layer)
        
        if "reference_id" in node["attributes"]:
            found = 0
            for ref in node["attributes"]["reference_id"]:
                if self.add_node_article_mapping(node["_id"], ref):
                    found+=1
            #if found!=len(node["attributes"]["reference_id"]):
            #    print(str(found)+"/"+str(len(node["attributes"]["reference_id"])))
            

        
    def add_node_layer(self,node_id,layer_name):               
        self.db.cur.execute("insert into network_node_layers (node_id, layer_name) values (%s,%s)",
                            (node_id,layer_name))        
        self.db.conn.commit()
        
    def add_network_node_mapping(self,network_id,node_id,x,y):
        self.db.cur.execute("insert into network_node_mapping (network_id, node_id, x, y) values (%s,%s,%s,%s)",
                            (network_id,node_id,x,y))        
        self.db.conn.commit()
                
    def add_edge(self,edge):        
        self.db.cur.execute("select edge_id,node_from,node_to from network_edges where edge_id=%s",(edge["_id"],))
        self.db.conn.commit()
        check = self.db.cur.fetchall()
        if len(check)>0:
            return #print("already exists...")
        else:
            # stop if we don't have the nodes in this map (why does kumu do this?)
            self.db.cur.execute("select node_id from network_nodes where node_id=%s",(edge["from"],))
            self.db.conn.commit()
            if len(self.db.cur.fetchall())==0:
                print("error adding edge: missing from node "+edge["from"])
                return
            self.db.cur.execute("select node_id from network_nodes where node_id=%s",(edge["to"],))
            self.db.conn.commit()
            if len(self.db.cur.fetchall())==0:
                print("error adding edge: missing to node "+edge["to"])
                return
            
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
            #if found!=len(edge["attributes"]["reference_id"]):
            #    print(str(found)+"/"+str(len(edge["attributes"]["reference_id"])))
        else:
            print("Connection: no reference exists "+edge["_id"]+" "+self.get_edge_titles(edge["_id"]))

            self.db.cur.execute("select edge_id,node_from,node_to from network_edges where node_from=%s and node_to=%s",(edge["from"],edge["to"]))
            self.db.conn.commit()
            check = self.db.cur.fetchall()
            if len(check)>0:
                print("Duplicate connection(s) found for "+edge["_id"])
                netnames = ["Coastal Security",
                            "Extreme Storms",
                            "Flooding and Drought",
                            "Food and Personal Security",
                            "Temperature"]
          
                for cedge in check:
                    if cedge[0]!=edge["_id"]:
                            
                        self.db.cur.execute("select network_id from network_edge_mapping where edge_id=%s",
                                            (cedge[0],))        
                        self.db.conn.commit()
                        r = self.db.cur.fetchall()
                        netname = ""
                        if len(r)>0:
                            netname = netnames[r[0][0]-1]
                    
                        self.db.cur.execute(f"select article_id from edge_article_mapping where edge_id=%s",(cedge[0],))
                        self.db.conn.commit()
                        s=""
                        for t in self.db.cur.fetchall():
                            s+=str(t[0])+" "
                        print(netname+" "+s+" ("+cedge[0]+")")



        
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

        #print(row_id)
        
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
                    print(row_id+" exists, but network error")
                # delete the error and try again
                #self.db.cur.execute("delete from articles where article_id=%s",(row[0],))
                #self.db.conn.commit()
                return
        
        ref = False
        #print(row_type)
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

    def add_node_article_mapping(self, node_id, article_id):
        if not article_id.isnumeric():
            print("Element: article id not numeric: "+article_id+" ("+self.get_node_title(node_id)+")")
            return 
            
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("Element: article num not in list: "+article_id+" ("+self.get_node_title(node_id)+")")
            return False

        self.db.cur.execute(f"""insert into node_article_mapping (node_id, article_id) values
        ('{node_id}','{article_id}')""")
        self.db.conn.commit()
        return True

    def add_edge_article_mapping(self, edge_id, article_id):
        if not article_id.isnumeric():
            print("Connection: article id not numeric: "+article_id+" ("+self.get_edge_titles(edge_id)+")")
            return 
        
        self.db.cur.execute("select article_id from articles where article_id=%s",(article_id,))
        self.db.conn.commit()
        if (len(self.db.cur.fetchall())==0):
            print("Connection: can't find article no: "+article_id+" ("+self.get_edge_titles(edge_id)+")")
            return False

        self.db.cur.execute(f"""insert into edge_article_mapping (edge_id, article_id) values
        ('{edge_id}','{article_id}')""")
        self.db.conn.commit()
        return True

    def get_edge_refs(self,edge_id):
        self.db.cur.execute(f"select article_id from edge_article_mapping where edge_id=%s",(edge_id,))
        self.db.conn.commit()
        s=""
        for t in self.db.cur.fetchall():
            s+=str(t[0])+" "
        return s
    
    def print_edge_refs(self,edge_id):
        netnames = ["Coastal Security",
                    "Extreme Storms",
                    "Flooding and Drought",
                    "Food and Personal Security",
                    "Temperature"]
        self.db.cur.execute("select network_id from network_edge_mapping where edge_id=%s",
                            (edge_id,))        
        self.db.conn.commit()
        r = self.db.cur.fetchall()
        netname = ""
        if len(r)>0:
            netname = netnames[r[0][0]-1]
            
        self.db.cur.execute(f"select article_id from edge_article_mapping where edge_id=%s",(edge_id,))
        self.db.conn.commit()
        s=""
        for t in self.db.cur.fetchall():
            s+=str(t[0])+" "
        print("     "+netname+" ["+s+"] ("+edge_id+")")


    
    def check_all_edges_for_dups(self):
        self.db.cur.execute("select edge_id,node_from,node_to from network_edges")
        self.db.conn.commit()
        all_edges = self.db.cur.fetchall()
        for edge in all_edges:
            # search for any more        
            self.db.cur.execute("select edge_id,node_from,node_to from network_edges where node_from=%s and node_to=%s and edge_id!=%s",(edge[1],edge[2],edge[0]))
            self.db.conn.commit()
            check = self.db.cur.fetchall()
            parent_refs = self.get_edge_refs(edge[0])
            if len(check)>0:
                problem = False
                for cedge in check:
                    if parent_refs!=self.get_edge_refs(cedge[0]):
                        problem = True
                if problem:
                    print(str(len(check))+" duplicate connection(s) found for "+self.get_edge_titles(edge[0])+" ("+edge[0]+")")
                    self.print_edge_refs(edge[0])          
                    for cedge in check:
                        if cedge[0]:
                            self.print_edge_refs(cedge[0])
                        

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

def lookup_item(l,id):
    for i in l:
        if i["_id"]==id:
            return i
    else:
        print("could not find "+id)
        return False


def write_adapations_for_debug(net,included_networks):
    struct = {}
    for map in net["maps"]:
        if map["name"] in included_networks:
            print(map["name"])
            struct[map["name"]]=[]
            for node in map["elements"]:
                el = lookup_item(net['elements'],node['element'])
                if el['attributes']['element type']=="Action":
                    struct[map["name"]].append(el)

    f = open("adaptations.json", "w")    
    f.write(json.dumps(struct,indent=2))
    f.close()

def write_adapation_hazards_for_debug(net,included_networks):
    struct = {}
    for map in net["maps"]:
        if map["name"] in included_networks:
            print(map["name"])
            struct[map["name"]]={}
            for node in map["elements"]:
                el = lookup_item(net['elements'],node['element'])
                if el['attributes']['element type']=="Action":
                    struct[map["name"]][el['attributes']['label']]=el['attributes']['climate_hazard']

    f = open("adaptation_ch.json", "w")    
    f.write(json.dumps(struct,indent=2))
    f.close()

def save_to_db(nd,net,included_networks):
    for map in net["maps"]:
        #if map["name"] in included_networks:
            print(map["name"]+" -------------------------------------------------")
            network_id = nd.add_network(map["name"])
            for node in map["elements"]:
                nd.add_node(lookup_item(net['elements'],node['element']))
                nd.add_network_node_mapping(network_id,
                                             node["element"],
                                             node["position"]["x"],
                                             node["position"]["y"])

            for edge in map["connections"]:
                conn = lookup_item(net['connections'],edge['connection'])
                # fix where kumu seems to include nodes not in this network
                nd.add_node(lookup_item(net['elements'],conn['from']))
                nd.add_node(lookup_item(net['elements'],conn['to']))
                nd.add_edge(conn)                
                nd.add_network_edge_mapping(network_id,edge['connection'])

        #nd.check_all_edges_for_dups()    

    
def load(db,path):    
    nd = network_db(db)
    #nd.reset_network()
    
    net = json.load(open(path))

    # add all the nodes and edges
    #for node in net["elements"]:
    #    nd.add_node(node)
    #for edge in net["connections"]:
    #    nd.add_edge(edge)

    included_networks = ["Coastal Security",
                         "Extreme Storms",
                         "Flooding and Drought",
                         "Food and Personal Security",
                         "Temperature"]

    save_to_db(nd,net,included_networks)




def load_refs(db,refssheet):                
    nd = network_db(db)
    ##nd.reset_refs()

    with open(refssheet) as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                nd.add_ref(row)

        print(nd.doi_lookup.errors)


                                   

        
