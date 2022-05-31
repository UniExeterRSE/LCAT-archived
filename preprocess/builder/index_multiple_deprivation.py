# Copyright (C) 2022 Then Try This
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the Common Good Public License Beta 1.0 as
# published at http://www.cgpl.org
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# Common Good Public License Beta 1.0 for more details.

# This script imports climate predictions downloaded from the
# http://uk-cri.org climate risk indicators, these are based on the
# MET Office HADGEM RCP85 model. They are 12km gridded model
# predictions, and include other higher level risk indicators we might
# be able to make use of in future.

# We import a grid as GEOJSON geometry and the model data each into
# their own tables indexed by grid cell id

import csv

# Insert IMD scores into each lsoa zone where the name matches (We
# need the lsoa zones present to do this) - might need to:

# ALTER TABLE lsoa ADD imdscore real;

def import(data_dir):    
    with open(data_dir+"imd2019lsoa.csv", newline='') as csvfile:
        reader = csv.reader(csvfile)
        for i,row in enumerate(reader):
            if i>0:
                #print(row)
                # get the IMD score only
                if row[5].startswith("a.") and row[2]=="Score":
                    lsoa_code = row[0]
                    score = row[4]                                  
                    q=f"update lsoa set imdscore='{score}' where lsoa11cd='{lsoa_code}';"
                    print(q)
                    cur.execute(q)                
                    conn.commit()
                

