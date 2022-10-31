// Copyright (C) 2022 Then Try This
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the Common Good Public License Beta 1.0 as
// published at http://www.cgpl.org
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// Common Good Public License Beta 1.0 for more details.

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import GeoJSONLoader from './GeoJSONLoader';
import './ClimateMap.css';
import LoadingOverlay from "react-loading-overlay";
import { nfviColumns } from "../core/climatejust.js";
const colormap = require('colormap');

const tileLayer = {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

const center = [52, -2.2];
const highlightCol = "#f5821fff";

function RegionsListener(props) {
    useEffect(() => {
        props.callback(props.regions,props.regionType);
    }, [props.regions,
        props.regionType]);
    return null;
}


class ClimateMap extends React.Component {
    constructor(props) {
        super(props);

        this.state={
            geojson_key: 0,
            geojson: false,
            regionType: "boundary_msoa",
            regions: [],
            loading: true,
            triggerLoadingIndicator: true,
            mapProperty: "imdscore"            
        };

        this.cols = colormap({
            colormap: 'bathymetry',
            nshades: 100,
            format: 'hex',
            alpha: 0.5
        });

        this.cols.reverse();
        this.score_adjust=0.7;
    }

    regionsIncludes = (id) => {
        return this.state.regions.filter(e => e.id===id).length>0;
    }
    
    // responsible for styling and callbacks for each region
    onEachFeature = async (feature, layer) => {        
        // colour based on IMD score
        let min = 0; // parseFloat(this.props.stats[this.props.regionType+"_"+this.state.mapProperty+"_min"]);
        let max = 13; // parseFloat(this.props.stats[this.props.regionType+"_"+this.state.mapProperty+"_max"]);
        let v = feature.properties[this.state.mapProperty];
        //let v = feature.properties["tas_end"]-feature.properties["tas_start"];
        let index = Math.round(((v-min)/(max-min))*99);
        
        let col = this.cols[index];

        let nfvi = nfviColumns[this.state.mapProperty];
        if (nfvi!=undefined) {
            // flip direction
            if (nfvi.direction=="less-than") {
                col=this.cols[100-index];
            }
        }

        col = "#00000000";
        
        let gid = feature.properties.gid;
        layer.bindTooltip(feature.properties.name+
                          "<br> "+feature.properties.gid+": "+this.state.mapProperty+" "+
                          feature.properties[this.state.mapProperty]+" "+v);
        layer.setStyle({
            'color': "#115158ff",
            'weight': 3,
            'fillColor': col,
            'fillOpacity': 1
        });

        
        if (this.regionsIncludes(gid)) {
            layer.setStyle({'fillColor': highlightCol});
        }

        layer.on('mouseover', function(e) {
            layer.bringToFront();
            layer.setStyle({'weight': 6});
        });
        
        layer.on('mouseout', function(e) {
            layer.setStyle({'weight': 3});
        });

        layer.on('click', () => {
            if (!this.regionsIncludes(gid)) {
                layer.setStyle({
                    'fillColor': highlightCol,
                    'fillOpacity': 1
                });
                
                this.setState((prev) => ({
                    // do not use push because [].push(1) = 1!? 
                    regions: [...prev.regions,{
                        id: gid,
                        name: feature.properties.name,
                        properties: feature.properties
                    }]
                }));
            } else {
                layer.setStyle({
                    'fillColor': col,
                    'fillOpacity': 1
                });
                
                this.setState((prev) => ({
                    regions: prev.regions.filter((v,i) => v.id!==gid)
                }));
            }
        });
    }

    geojsonCallback = (data) => {
        if (data.features!=null) {
            this.setState(() => ({
                geojson: data,
                geojson_key: this.state.geojson_key+1,
                triggerLoadingIndicator: false
            }));
        }
    }

    regionTypeToName = (type) => {
        if (type=="boundary_la_districts") return "Local Authority Districts";
        if (type=="boundary_uk_counties") return "UK Counties";
        if (type=="boundary_parishes") return "Parishes (Eng/Wales)";
        if (type=="boundary_msoa") return "MSOA (Eng/Wales)";
        if (type=="boundary_sc_dz") return "Data Zones (Scotland)";
        return "LSOA";
    }
    
    render() {
        return (
            <div>
              <h1>Select Zones</h1>     
              <p>
                To begin, click/tap on the map to select the 
                <select onChange={(e) => { this.setState(() => ({
                    regionType: e.target.value,
                    // clear regions when the type changes
                    regions: [],
                    triggerLoadingIndicator: true
                }));}}>
                  <option value="boundary_la_districts">Local Authority Districts</option>
                  <option value="boundary_uk_counties">UK Counties</option>
                  <option value="boundary_parishes">Parishes (Eng/Wales)</option>
                  <option value="boundary_msoa">MSOA (Eng/Wales)</option>
                  <option value="boundary_sc_dz">Data Zones (Scotland)</option>
                  <option value="boundary_lsoa">LSOA (Eng/Wales)</option>
                </select>
                you are interested in. {/*The Index of Multiple Deprivation score 

		  <select onChange={(e) => { this.setState(() => ({
                    mapProperty: e.target.value,
                    geojson_key: this.state.geojson_key+1,
                }));}}>                  
                  <option value="imdscore">Index of Multiple Deprivation</option>
                  {Object.keys(nfviColumns).map((k) => (
                      <option value={k}>{nfviColumns[k].name.slice(0,30)}</option>
                  ))}
                  </select> 
                
                  is shown to help guide you to priority areas. */}
              </p>
              
              <RegionsListener
                regions={this.state.regions}
                regionType={this.state.regionType}
                callback={this.props.regionsCallback}
              />

              <LoadingOverlay
                active={this.state.loading}
                spinner
                text={'Loading '+this.regionTypeToName(this.state.regionType)}>
                <MapContainer
                  center={center}
                  zoom={12}
                  scrollWheelZoom={true}>
                  <GeoJSONLoader
                    apicall={"/api/region"}
                    table={this.state.regionType}
                    callback={this.geojsonCallback}
                    loadingCallback={ loading => { this.setState(() => ({ loading: loading && this.state.triggerLoadingIndicator })); }}
                  />
                  { this.state.geojson &&               
                    <GeoJSON
                      key={this.state.geojson_key}
                      data={this.state.geojson}
                      onEachFeature={this.onEachFeature}/> }
                  <TileLayer {...tileLayer} />
                </MapContainer>
              </LoadingOverlay>
              <p>
                English Indices of Deprivation 2019 Open Data from <a href="https://opendatacommunities.org/resource?uri=http%3A%2F%2Fopendatacommunities.org%2Fdata%2Fsocietal-wellbeing%2Fimd2019%2Findices">
                                                                     Ministry of Housing, Communities and Local Government</a>
              </p>

            </div>
        );
    }
}

export default ClimateMap;
