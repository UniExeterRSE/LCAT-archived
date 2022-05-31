from builder import climate_db
from builder import ukcri
import yaml

def load_config():
    with open('config.yml') as f:
        return yaml.load(f,Loader=yaml.FullLoader)

conf = load_config()
    
# load model data
db = climate_db.db(conf)
ukcri.load(db,conf['uk_cri_data_path'])

# import lsoa

# shp2pgsql -I -s 2263 SHAPEFILE.shp DATATABLE | psql -U DATABASE_USER -d DATABASE_NAME -h localhost


# load IMD

# connect lsoa to climate tiles

# load network
