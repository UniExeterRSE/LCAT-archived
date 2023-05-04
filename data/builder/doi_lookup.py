import json
import urllib.request
import xmltodict
import time
import xml

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

        #print("reading doi.org: "+doi)
        try:
            r = opener.open('http://dx.doi.org/'+doi)
            t = r.read()
            d = xmltodict.parse(t)

            type = type.strip()
            #print("["+type+"]")
            if type=="Journal Article" or type=="Journal article":
                self.read_article(doi,d)
            else:
                self.read_book(doi,d)
                    
            return self.doicache[doi]
        
        except xml.parsers.expat.ExpatError as e:
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
        except urllib.error.HTTPError as e:
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


    def read_year(self,date):
        if isinstance(date, list):
            for d in date:
                if d["@media_type"]=="print":
                    return d["year"]
        else:
            return date["year"]

        

    def read_contributors(self,contributors):
        if "organization" in contributors:
            return self.read_authors_org(contributors["organization"])
        else:
            return self.read_authors(contributors["person_name"])

        
    def read_authors(self,person_name):
        authors = ""
        alist = person_name
        #print(alist)
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

    def read_authors_org(self,person_name):
        authors = ""
        alist = person_name
        #print(alist)
        if isinstance(alist, list):
            for contributor in alist:
                if contributor["@contributor_role"]=="author":
                    given_name = ""
                    if "author" in contributor: 
                        given_name = contributor["author"]
                    
                    authors+=(given_name+", ")
        else:
            given_name = ""
            if "author" in alist: 
                given_name = alist["author"]
            authors+=(given_name+", ")
        return authors

    
    def read_book(self,doi,d):
        #print (json.dumps(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"], indent=4))

        if "journal" in d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]:
            self.read_article(doi,d)
            return
        
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
            authors = self.read_contributors(book["content_item"]["contributors"])
        else:
            authors = self.read_contributors(book[main_key]["contributors"])

        date=self.read_year(book[main_key]["publication_date"])
                
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

    def read_conference(self,doi,d):
        article = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["conference"]["conference_paper"]
        #print(article.keys())
        title = article["titles"]["title"]
        date = self.read_year(article["publication_date"])
        authors = self.read_contributors(article["contributors"])
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

    def read_report_paper(self,doi,d):
        article = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["report-paper"]["report-paper_metadata"]
        title = article["titles"]["title"]
        date = self.read_year(article["publication_date"])
        authors = self.read_contributors(article["contributors"])        
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
        
    def read_article(self,doi,d):
        result = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]
        #print (result.keys())
        
        if "journal" not in result:
            if "book" in result:
                self.read_book(doi,d)
                return

            if "conference" in result:
                self.read_conference(doi,d)                
                return

            if "report-paper" in result:
                self.read_report_paper(doi,d)                
                return

            
            article = result["posted_content"]
            title = article["titles"]["title"]
            date = self.read_year(article["acceptance_date"])
            authors = self.read_contributors(article["contributors"])        
            
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

        journal = result["journal"]
        article = journal["journal_article"]

        title = article["titles"]["title"]
        if isinstance(title,dict):
            title=title["#text"]
        
        authors = self.read_contributors(article["contributors"])        
        date = self.read_year(article["publication_date"])
                
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

        #print (self.doicache[doi])
        
    def get_reference(self,doi):
        if doi in self.doicache:
            return self.doicache[doi]
        else:
            return "reference not found"
