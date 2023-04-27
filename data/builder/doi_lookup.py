import json
import urllib.request
import xmltodict
import time

# Use doi.org API to look up paper information
# This is not particularly good, or useful - just scraping

class doi_lookup:
    def __init__(self):
        self.doicache = {}
        self.link_overrides = {}
        self.errors = []

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
    def doi2info(self,doi,type):
        doi = doi.strip()
        if doi in self.doicache:
            return self.doicache[doi]
        
        opener = urllib.request.build_opener()
        opener.addheaders = [('Accept', 'application/vnd.crossref.unixsd+xml'),
                             ('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36')]

        print("reading doi.org: "+doi)
        try:
            r = opener.open('http://dx.doi.org/'+doi)
            d = xmltodict.parse(r.read())

            type = type.strip()
            print("["+type+"]")
            if type=="Journal Article" or type=="Journal article":
                self.read_article(doi,d)
            else:
                self.read_book(doi,d)
                    
            return self.doicache[doi]
        except Exception as e:
            print (e)
            self.errors.append(doi)
            self.doicache[doi]={
                "type": "ERROR",
                "doi": doi,
                "title": "ERROR",
                "authors": "",
                "date": "",
                "journal": "",
                "issue": "",
            }
            return self.doicache[doi]


    def read_authors(self,person_name):
        authors = ""
        alist = person_name
        print(alist)
        if isinstance(alist, list):
            for contributor in alist:
                if contributor["@contributor_role"]=="author":
                    given_name = ""
                    if "given_name" in contributor: 
                        given_name = contributor["given_name"]
                    
                    authors+=(given_name+" "+contributor["surname"]+", ")
        else:
            given_name = ""
            if "given_name" in alist: 
                given_name = alist["given_name"]
            authors+=(given_name+" "+alist["surname"]+", ")
        return authors

    
    def read_book(self,doi,d):
        #print (json.dumps(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"], indent=4))

        book = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["book"]
        #print (json.dumps(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"], indent=4))
        #print (json.dumps(book, indent=4))

        for k in book.keys():
            print(k)

        main_key = 'book_metadata' 
        if not main_key in book:
            main_key = 'book_series_metadata'

        title = book[main_key]["titles"]["title"]

        authors = ""
        if "content_item" in book:
            authors = self.read_authors(book["content_item"]["contributors"]["person_name"])
        else:
            authors = self.read_authors(book[main_key]["contributors"]["person_name"])

        print (book[main_key]["publication_date"])
            
        date=book[main_key]["publication_date"]["year"]
                
        journal_title = ""

        issue=""

        self.doicache[doi]={
            "type": "article",
            "doi": doi,
            "title": title,
            "authors": authors,
            "date": date,
            "journal": journal_title,
            "issue": issue,
        }


    def read_article(self,doi,d):
        if "journal" not in d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]:
            if "book" in d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]:
                print("ITS A BOOK")
                self.read_book(doi,d)
                return
            article = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["posted_content"]
            title = article["titles"]["title"]
            date = article["acceptance_date"]["year"]
            authors = self.read_authors(article["contributors"]["person_name"])
            
            self.doicache[doi]={
                "type": "article",
                "doi": doi,
                "title": title,
                "authors": authors,
                "date": date,
                "journal": "",
                "issue": "",
            }
            return

        journal = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]
        article = journal["journal_article"]

        title = article["titles"]["title"]
        if isinstance(title,dict):
            title=title["#text"]
        
        authors = self.read_authors(article["contributors"]["person_name"])

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
                if isinstance(journal["journal_issue"]["issue"],dict):
                    issue=journal["journal_issue"]["issue"]["#text"]
                else:
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
        }

        print (self.doicache[doi])
        
    def get_reference(self,doi):
        if doi in self.doicache:
            return self.doicache[doi]
        else:
            return "reference not found"
