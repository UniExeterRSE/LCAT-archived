# Copyright (C) 2023 Then Try This
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the Common Good Public License Beta 1.0 as
# published at http://www.cgpl.org
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# Common Good Public License Beta 1.0 for more details.

from builder import coastal

class hazards_db:
    def __init__(self,db,boundary):
        self.db = db
        self.boundary = boundary
        self.hazards = [
            "temperature",
            "heat",
            "drought",
            "flooding",
            "sea_level_rise",
            "extreme_storms",
            "coastal_erosion",
            "coastal"
        ]

    def reset(self):
        cols = [["id","serial primary key"],
                ["gid","int"], # foreign key???
                ["tile_id","int"]]
        
        for h in self.hazards: cols.append([h,"int"])
        
        self.db.create_tables({f"{self.boundary}_hazards": cols})



def reset(db,boundary):
    hd = hazards_db(db,boundary)
    hd.reset()

def load_coastal(db,boundary,filename):
    coastal.load(db,boundary,filename)
