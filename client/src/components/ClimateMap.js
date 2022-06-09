// -*- mode: rjsx-mode;  -*-

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup, Popup, useMap } from 'react-leaflet';
import GeoJSONLoader from './GeoJSONLoader.js';
import './ClimateMap.css';

const colormap = require('colormap');

const tileLayer = {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

const center = [52, -2.2];
const highlight_col = "#ffbc42";

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
            regionType: "counties",
            regions: []
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

    // responsible for styling and callbacks for each region
    onEachFeature = async (feature, layer) => {        
        // colour based on IMD score
        let col = this.cols[Math.round(feature.properties.imdscore/this.score_adjust)];
        let gid = feature.properties.gid;
		layer.bindTooltip(feature.properties.name+
                          "<br>IMD Score: "+
                          feature.properties.imdscore);
        
        layer.setStyle({
            'weight': 1,
			'fillColor': col,
			'fillOpacity': 1
		});

        
        if (this.state.regions.includes(gid)) {
            layer.setStyle({'fillColor': highlight_col});
        }

	    layer.on('mouseover', function(e) {
		    layer.bringToFront();
		    layer.setStyle({'weight': 3});
	    });
        
	    layer.on('mouseout', function(e) {
		    layer.setStyle({'weight': 1});
	    });

		layer.on('click', () => {
 			if (!this.state.regions.includes(gid)) {
                console.log("adding");
				layer.setStyle({
					'fillColor': highlight_col,
					'fillOpacity': 1
				});
                
                this.setState((prev) => ({
                    // do not use push because [].push(1) = 1!? 
                    regions: [...prev.regions,gid]
                }));
			} else {
                console.log("removing");
				layer.setStyle({
					'fillColor': col,
					'fillOpacity': 1
				});
                
                this.setState((prev) => ({
                    regions: prev.regions.filter((v,i) => v!=gid)
                }));
			}
		});
    }

    geojsonCallback = (data) => {
        this.setState(() => ({
            geojson: data,
            geojson_key: this.state.geojson_key+1
        }));
    }

    render() {
        return (
            <div>
              <select onChange={(e) => { this.setState(() => ({
                  regionType: e.target.value,
                  // clear regions when the type changes
                  regions: []
              }));}}>
                <option value="counties">Counties</option>
                <option value="msoa">MSOA</option>
                <option value="lsoa">LSOA</option>
              </select>
              <RegionsListener
                regions={this.state.regions}
                regionType={this.state.regionType}
                callback={this.props.regionsCallback}
              />
              <MapContainer
                center={center}
                zoom={7}
                scrollWheelZoom={true}>
                <GeoJSONLoader
                  apicall="http://localhost:3000/api/region"
                  table={this.state.regionType}
                  callback={this.geojsonCallback}/>
                { this.state.geojson &&               
                  <GeoJSON
                    key={this.state.geojson_key}
                    data={this.state.geojson}
                    onEachFeature={this.onEachFeature}/> }
                <TileLayer {...tileLayer} />
              </MapContainer>
            </div>
        );
    }
}

export default ClimateMap;
