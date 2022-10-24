# Data sources

All the sources of data used for LCAT, with their authorities, links
to original downloads and instructions for processing with the LCAT
build scripts.

## Climate model
        
| Type              | Notes                                                                   |  Time span                   | Regions             | LCAT postgres table/col                   | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------------------------|---------------------|------------------------------------------|-----------------|-------------------|------------|----------------------------|
| Decade mean tifs  | Intermediate format taken from Turing Institute run means, one per decade/variable|                              | Great Britain & IoM | -                                         | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Air temp annual   | These are all stored in a single table per season to opimise for reading| 1980-2079 averaged by decade | Great Britain & IoM | `chess_scape_<rcp>_annual/tas_<decade>`    | GeoTiff         | -                 | -          | https://uk-scape.ceh.ac.uk |  
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

## Climate model steps
    
1. Original data is CHESS-SCAPE RCP6.0 & 8.5, 1km grid cells, seasonal
mean of all 4 model runs generated by Turing Institute in GeoTif
format.

2. We build decade average tifs for each variable and season (summer,
winter and annual) as intermediate GeoTifs for uploading to our
server.
    
3. Finally we put all decades and variables togther in the same tables
separated for RCP and season. These tables are indexed by grid cell
location ID based on grid x/y position for quick access.

4. When requesting climate data we specify a list of regions. We
lookup all the 1km grid cells overlapped by all the regions, removing
duplicates and average across the cells rather than storing averages
for each boundary region. This avoids counting grid cells twice if
they overlap with multiple boundaries.
    
### Processing

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