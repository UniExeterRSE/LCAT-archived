import React from 'react';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup, Popup, useMap } from 'react-leaflet';
import GeoJSONLoader from './GeoJSONLoader.js';
import './ClimateMap.css';

const colormap = require('colormap');

const tileLayer = {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

const center = [52, -2.2];

class ClimateMap extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            geojson_key: 0,
            geojson: false,
            region: "counties"
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
        
    onEachFeature = (feature, layer) => {
        
        let col = this.cols[Math.round(feature.properties.imdscore/this.score_adjust)];

		layer.bindTooltip(feature.properties.name+
                          "<br>IMD Score: "+
                          feature.properties.imdscore);
	
        layer.setStyle({
            'weight': 1,
			'fillColor': col,
			'fillOpacity': 1
		});
                 
	    layer.on('mouseover', function(e) {
		    layer.bringToFront();
		    layer.setStyle({'weight': 3});
	    });
	    layer.on('mouseout', function(e) {
		    layer.setStyle({'weight': 1});
	    });

    }

    geojsonCallback = (data) => {
        this.setState({
            geojson: data,
            geojson_key: this.state.geojson_key+1
        });
    }

    regionChange = (e) => {
        this.setState({ region: e.target.value });
    }
    
    render() {
        return (
            <div>
              <select onChange={this.regionChange}>
                <option value="counties">Counties</option>
                <option value="msoa">MSOA</option>
                <option value="lsoa">LSOA</option>
              </select>
              <MapContainer
                center={center}
                zoom={7}
                scrollWheelZoom={true}>
                <GeoJSONLoader
                  apicall="http://localhost:3000/api/region"
                  table={this.state.region}
                  callback={this.geojsonCallback}/>
                {this.state.geojson &&               
                 <GeoJSON
                   key={this.state.geojson_key}
                   data={this.state.geojson}
                   onEachFeature={this.onEachFeature}/>
                }
                <TileLayer {...tileLayer} />
              </MapContainer>
            </div>
        );
    }
}

export default ClimateMap;
