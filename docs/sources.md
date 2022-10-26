# Data sources

All the sources of data used for LCAT, with their authorities, links
to original downloads and instructions for processing with the LCAT
build scripts.

## Climate model
        
| Type              | Notes                                                                   |  Time span                   | Regions             | LCAT postgres table/col                   | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------------------------|---------------------|------------------------------------------|-----------------|-------------------|------------|----------------------------|
| Seasonal mean GeoTifs | Means of CHESS-SCAPE RCP6.0/8.5 model runs, one per variable, provided by the Alan Turing Institute. | 1980-2079 averaged by season | Great Britain & IoM | -                                         | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Decade mean GeoTifs | Intermediate format generated from seasonal means, one per decade/variable | 1980-2079  averaged by decade | Great Britain & IoM | -                                         | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Air temp annual   | These are all stored in a single table per season/rcp to optimise for reading| 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_annual/tas_<decade>`    | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Rain annual       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_annual/pr_<decade>`     | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness annual |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_annual/rsds_<decade>`   | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Wind annual       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_annual/sfcWind_<decade>`| GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Air temp summer   |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_summer/tas_<decade>`    | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Rain summer       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_summer/pr_<decade>`     | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness summer |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_summer/rsds_<decade>`   | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Wind summer       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_summer/sfcWind_<decade>`| GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Air temp winter   |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_winter/tas_<decade>`    | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Rain winter       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_winter/pr_<decade>`     | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness winter |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_winter/rsds_<decade>`   | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Wind winter       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_winter/sfcWind_<decade>`| GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
| Climate data grid | 1km grid, needed to link climate data variables to boundares (converted to EPSG 4326) | n/a                          | Great Britain & IoM | `chess_scape_grid`                         | GeoTiff         | EPSG 4326         | -          | https://uk-scape.ceh.ac.uk | 

## Boundaries

| Type              | Notes                                                                   |  Time span | Regions             | LCAT postgres table/col  | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------|---------------------|--------------------------|-----------------|-------------------|------------|----------------------------|
| LSOA              | Areas with average population sizes of 1500 people or 650 households    | 2011       | England and Wales   | `boundary_lsoa`          | ESRI shapefile  | EPSG 27700        | https://datashare.ed.ac.uk/handle/10283/2546 | University of Edinburgh |   
| MSOA              |                                                                         | 2016       | England and Wales   | `boundary_msoa`          | ESRI shapefile  | EPSG 27700        | https://data.gov.uk/dataset/2cf1f346-2f74-4c06-bd4b-30d7e4df5ae7/middle-layer-super-output-area-msoa-boundaries | data.gov.uk |
| Data Zones        | Scottish equivalent of LSOA                                             | 2020       | Scotland            | `boundary_sc_dz`         | ESRI shapefile  | EPSG 4326         | https://simd.scot/#/simd2020/BTTTFTT/12/-4.6223/55.5558/ | scot.gov |   
| Local Authority Districts |                                                                 | 2022       | UK                  | `boundary_la_districts`  | ESRI shapefile  | EPSG 27700        | https://geoportal.statistics.gov.uk/datasets/ons::local-authority-districts-may-2022-uk-bfc-v3/ | ONS |             
| UK Counties       | Could not find a non-paywalled download on .gov.uk                      | ?          | UK                  | `boundary_uk_counties`   | ESRI shapefile  | EPSG 32630        | https://www.ukpostcode.net/shapefile-of-uk-administrative-counties-wiki-16.html | ukpostcode.net?? |             
| Parishes          | England/Wales only                                                      | 2019       | England and Wales   | `boundary_uk_counties`   | ESRI shapefile  | EPSG 27700        | https://geoportal.statistics.gov.uk/datasets/parishes-and-non-civil-parished-areas-april-2019-ew-bgc/ | ONS |
    
## Vulnerability data

| Type              | Notes                                                                   |  Time span | Regions             | LCAT postgres table/col  | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------|---------------------|--------------------------|-----------------|-------------------|------------|----------------------------|
| NFVI variables    | Neighbourhood Flood Vulnerability Index (NFVI) Supporting Variables	  |	2017       | UK                  | `nfvi`                   | ESRI Shapefile  | -                 | https://www.climatejust.org.uk/map | Climate Just |    

    
## Impact network data

| Type              | Notes                                                                   |  Time span | Regions             | LCAT postgres table/col  | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------|---------------------|--------------------------|-----------------|-------------------|------------|----------------------------|

    
## Linking the climate model with the boundary regions
    
1. Original data is CHESS-SCAPE RCP6.0 & 8.5, 1km grid cells, seasonal
mean of all 4 model runs generated by Turing Institute in GeoTif
format.

2. We build decade average tifs for each variable and season (summer,
winter and annual) as intermediate GeoTifs for uploading to our
server.
    
3. Finally we put all decades and variables togther in the same tables
separated for RCP and season. These tables are indexed by grid cell
location ID based on grid x/y position for quick access.

#### Method 1 - Cell lookup (used for msoa, parishes, datazones, lsoa)
    
When requesting climate data we specify a list of regions. We lookup
all the 1km grid cells overlapped by all the regions, removing
duplicates and average across the climate model cells. This avoids
counting grid cells twice if they overlap with multiple boundaries.

This method is best for larger grid cells or smaller boundaries, as
overlaps will have more affect and averaging cells will be a
relatively minor computation.

#### Method 2 - Cached averages (used for counties and la districts)

We cache all the grid cell averages for each boundary. Then the
computation on the server is simply a matter of averaging the
boundaries the user has selected (no secondary conversion to grid cell
required).

This method works better for smaller grid cells and larger boundaries,
as e.g. The Scottish highlands boundary covers thousands of 1km grid
cells. In these cases the effect of duplicating edge cells that
overlap neighbouring boundaries will be minimal, and the compuatation
cost becomes problematic.
    
### Processing steps

LCAT comes with a build script to generate and reformat the data such
that it is optimised for reading by the online client. First set up
`config.yml` with all the locations of the data.
    
Build all the decade averaged GeoTiff files from the yearly ones:
    
    $ ./build chess_tiff_create_batch

Put all the generated files in the location specified in `config.yml`
and run:

    $ ./build chess_tiff_import

This populates the database tables with all climate variables and
decades so the server can provide them in a single select statement
(averaged across boundaries)

We also need to load the grid used by 
    
    $ ./build chess_tiff_grid <name of a GeoTiff file>

Once we have a climate data grid we need to import the boundaries we
wish to use, and link them to the climate data grid:

    $ ./build boundary_<boundary_type>
    $ ./build link_<boundary_type>
    
Linking creates a new table <boundary_type>_grid_mapping, which is a
many to many mapping from boundary IDs to all the climate grid IDs
they overlap or intesect with.

Create the caches - this works across all boundaries and all climate
rcp/season tables.

    $ ./build cache_climate

## Calculating the vulnerabilities for boundaries 

Vulnerabilities are supplied per LSOA/Datazone - so we need to average
them across the other boundaries. To do this we take centroids of each
LSOA and, calculate averages based on all the centroids that are
inside the boundary. This works well for larger bounderies more or
less aligned (msoa, counties) but less well for small ones which are
not (parishes).

In the case that there are no LSOA centroids inside our boundary, we
average together the vulnerability data from the LSOAs with centroids
inside the bounding box for our boundary instead.

In the case of LSOAs or Data Zones being used, we just map them one to
one.

Similarly to the climate data, in order to speed up the processing and
allow for new data to be added more simply, we link zones to their
underlying LSOA or Data Zones. This needs to be done before we can
calculate the vulnerabilities:
   
    $ ./build link_all_to_lsoa
    $ ./build link_all_to_sc_dz

Now we can load the Climate Just nfvi variables in (this contains everything)

    $ ./build climatejust_load_nfvi

Then we can create the Climate Just vulnerability tables for each
boundry type:

    $ ./build climatejust_average_nfvi

There is a question as to whether is it right to average vulnerability
information - should we show the max or min of a variable rather than
losing outliers by averaging?
    
### Index of multiple deprivation
    
The IMD ranks and deciles need to be loaded from the cvs files - they
are bolted on to the vulnerability tables as additional columns, first
the loading into LSOA and Data Zone vulnerabilities - which is pretty
slow:

    $ ./build load_imd_from_csv

Then the averaging them across the rest:
    
    $ ./build add_average_imd
               
### GeoTiff CRS

For reference, this is the coordinate reference system for the GeoTiffs
       
    PROJCS["unnamed",
      GEOGCS["unknown",
        DATUM["unnamed",
          SPHEROID["Spheroid",6377563.396,299.3249646]
        ],
        PRIMEM["Greenwich",0],
        UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]]
      ],
      PROJECTION["Transverse_Mercator"],
      PARAMETER["latitude_of_origin",49],
      PARAMETER["central_meridian",-2],
      PARAMETER["scale_factor",1],
      PARAMETER["false_easting",400000],
      PARAMETER["false_northing",-100000],
      UNIT["metre",1,AUTHORITY["EPSG","9001"]],
      AXIS["Easting",EAST],
      AXIS["Northing",NORTH]
    ]