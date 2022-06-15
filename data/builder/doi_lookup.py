import json
import urllib.request
import xmltodict
import time

# Use doi.org API to look up paper information

class doi_lookup:
    def __init__(self):
        self.doicache = {}

        self.link_overrides = {
            "10.1016/j.scitotenv.2020.136678":"https://www.researchgate.net/publication/338601800_Suburb-level_changes_for_active_transport_to_meet_the_SDGs_Causal_theory_and_a_New_Zealand_case_study",
            "10.1016/j.jtrangeo.2019.04.016":"https://www.researchgate.net/publication/332932885_Weather_and_cycling_in_New_York_The_case_of_Citibike"    
        }


    def print():
        for doi in self.doicache.keys():
            p = self.doicache[doi]
            if p["type"]=="link":
                print(doi)
            else:
                print(self.doicache[doi]["title"]+" http://doi.org/"+doi)

    # elements:
    # Label, Type, Tags, Description, References, DOI, UN SDG, Variables
    # Tags = "climate variable"
    def doi2info(self,doi):
        if doi in self.doicache:
            return self.doicache[doi]
        
        if doi.startswith("http") or doi.startswith("Reference"):
            self.doicache[doi] = { 
                "doi": doi,
                "type": "link",
                "link": doi
            }
            return self.doicache[doi]
    
        opener = urllib.request.build_opener()
        opener.addheaders = [('Accept', 'application/vnd.crossref.unixsd+xml')]
        while True:
            print("reading doi.org: "+doi)
            r = opener.open('http://dx.doi.org/'+doi)
            d = xmltodict.parse(r.read())
            print("done")
            journal = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]
            article = journal["journal_article"]
            #print (json.dumps(journal, indent=4))

            #print(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]["journal_article"])
            title = article["titles"]["title"]

            authors = ""
            for contributor in article["contributors"]["person_name"]:
                if contributor["@contributor_role"]=="author":
                    authors+=(contributor["given_name"]+" "+contributor["surname"]+", ")

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

            link = "http://doi.org/"+doi

            if doi in self.link_overrides:
                link = self.link_overrides[doi]
                    
            self.doicache[doi]={
                "type": "article",
                "doi": doi,
                "title": title,
                "authors": authors,
                "date": date,
                "journal": journal_title,
                "issue": issue,
                "link": link
            }

            return self.doicache[doi]

    def get_reference(self,doi):
        if doi in self.doicache:
            return self.doicache[doi]
        else:
            return "reference not found"
