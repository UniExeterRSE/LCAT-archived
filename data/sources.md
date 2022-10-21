# Data sources

Keep updated with latest

## Climate model

* CHESS-SCAPE RCP6.0 & 8.5, 1km grid cells, mean of all 4 model runs by Turing Institute.
* We take original 100 year tif files and build decade averages as intermediate data format for loading on the server.
        
| Type              | Notes                                                                   |  Time span                   | Regions             | LCAT build command      | LCAT postgres table/col                   | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------------------------|---------------------|-------------------------|-------------------------------------------|-----------------|-------------------|------------|----------------------------|
| Decade mean tifs  | Intermediate format taken from Turing run means, one per decade/variable|                              | Great Britain & IoM | `chess_tif_create_batch`| -                                         | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Air temp annual   | These are all stored in a single table per season to opimise for reading| 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        |`chess_scape_<rcp>_annual/tas_<decade>`    | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Rain annual       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_annual/pr_<decade>      | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness annual |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_annual/rsds_<decade>    | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Wind annual       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_annual/sfcWind_<decade> | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Air temp summer   |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_summer/tas_<decade>     | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Rain summer       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_summer/pr_<decade>      | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness summer |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_summer/rsds_<decade>    | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Wind summer       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_summer/sfcWind_<decade> | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Air temp winter   |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_winter/tas_<decade>     | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Rain winter       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_winter/pr_<decade>      | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Cloudiness winter |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_winter/rsds_<decade>    | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Wind winter       |                                                                         | 1980-2079 averaged by decade | Great Britain & IoM | chess_tif_import        | chess_scape_<rcp>_winter/sfcWind_<decade> | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk |  
| Climate data grid | 1km grid, needed to linking climate data variables to boundares         | n/a                          | Great Britain & IoM | chess_scape_grid <file> | chess_scape_grid                          | GeoTiff         | EPSG 9001         | -          | https://uk-scape.ceh.ac.uk | 

## Boundaries

| Type              | Notes                                                                   |  Time span                   | Regions             | LCAT build command      | LCAT postgres table/col                   | Original Format | Coordinate system | Source URL | Authority                  |
|-------------------|-------------------------------------------------------------------------|------------------------------|---------------------|-------------------------|-------------------------------------------|-----------------|-------------------|------------|----------------------------|
| LSOA              | Areas with average population sizes of 1500 people or 650 households    |  -                           | England and wales   | lsoa                    | lsoa                                      | ESRI shapefile  | 