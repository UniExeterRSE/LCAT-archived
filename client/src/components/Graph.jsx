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

import React, { useState, useEffect } from 'react';
import {XYPlot, XAxis, YAxis, VerticalBarSeries, makeWidthFlexible, LabelSeries} from 'react-vis';
import useCollapse from 'react-collapsed';
import ClimatePredictionLoader from './ClimatePredictionLoader';

import '../../node_modules/react-vis/dist/style.css';
import ModelLoader from './ModelLoader';
import './Graph.css';
import { andify } from '../utils/utils';

const FlexibleXYPlot = makeWidthFlexible(XYPlot); 
const winterCol = "#a4f9c8";
const summerCol = "#4c9f70";
const selectedRegionCol = "#216331";

function Graph(props) {

    const [data, setData] = useState([]);
    const [labelData, setLabelData] = useState([]);

    const [season,setSeason] = useState("annual");
    const [rcp,setRcp] = useState("rcp60");
    const [variable,setVariable] = useState("tas");
    const [prediction,setPrediction] = useState([]);
    
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    function getYAxis() {
        if (variable=="tas") return 'Temperature (°C)';
        if (variable=="pr") return 'Rainfall (mm/day)';
        if (variable=="sfcwind") return 'Wind (m/s)';
        return 'Cloudiness (W/m²)';
    }

    function getLabel(v) {
        if (variable=="tas") return v.toFixed(2)+'°C';
        if (variable=="pr") return v.toFixed(2)+' mm/day';
        if (variable=="sfcwind") return v.toFixed(2)+' m/s';
        return v.toFixed(2)+' W/m²';
    }
    
    useEffect(() => {
        //setData(data.map(v => ({x: v.year, y: v.avg})));
        //setLabelData(data.map(v => ({x: v.year, y: v.avg+0})));
        if (prediction.length>0) {
            let out = [];
            let label = [];
            if (prediction[0][variable+"_1980"]!=null) {            
                for (let year of ["1980","2030","2040","2050","2060","2070"]) {
                    let label_year = year;
                    if (year=="1980") label_year="1980 baseline";
                    out.push({x: label_year, y:prediction[0][variable+"_"+year]});
                    label.push({x: label_year, y:prediction[0][variable+"_"+year]});
                }            
                setData(out);
                setLabelData(label);
            }
        }
    }, [prediction,variable]);         
    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (        
        <div className="collapsible">
          <div className="header" {...getToggleProps()}>
            {isExpanded ? 'Hide' : 'Show'} more 
          </div>
          <div {...getCollapseProps()}>

              <ClimatePredictionLoader
                regions = {props.regions}
                regionType = {props.boundary}
                average = {season}
                rcp = {rcp}
                callback = {(prediction) => {
                    setPrediction(prediction);}}
                loadingCallback={ loading => { }}
              />

            
            <div className="content">
              <p>
                The graph below shows the future climate change 
                expected in&nbsp; 
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>
                
                .&nbsp;You are viewing the 

                <select onChange={(e) => { setSeason(e.target.value); }}>           
                  <option value="annual">yearly averages</option>
                  <option value="summer">summer averages</option>
                  <option value="winter">winter averages</option>
                </select>

                for 

                <select onChange={(e) => { setVariable(e.target.value); }}>
                  <option value="tas">temperature</option>
                  <option value="pr">rain</option>
                  <option value="sfcwind">wind</option>
                  <option value="rsds">cloudiness</option>
                </select>

                under the 
                
                <select onChange={(e) => { setRcp(e.target.value); }}>           
                  <option value="rcp60">existing global policies</option>
                  <option value="rcp85">worst case scenario</option>
                </select>
                
                {rcp=="rcp60" && <span>(equivalent to global warming level of 2.0-3.7C which is RCP 6.0)</span>}
                {rcp=="rcp85" && <span>(equivalent to global warming level of 3.2-5.4C which is RCP 8.5)</span>}.

                Tick this [] to overlay UK average data.
                
              </p>

              <div className="graph-horiz-container">
                <FlexibleXYPlot height={300} xType="ordinal" color={selectedRegionCol}>
                  <XAxis
                    title = "Decades"
                    style={{ title: {fontSize: 20} }}/>
                  <YAxis
                    title = {getYAxis()}
                    position = "middle"
                    style={{ title: {fontSize: 20} }}/>
                  <VerticalBarSeries
                    animation
                    data={data} />
                  <LabelSeries
                    animation
                    data={labelData}
        /*labelAnchorY = {"auto"}*/
                    labelAnchorX = {"middle"}
                    getLabel={(d) => getLabel(d.y)}/>
                </FlexibleXYPlot>
              </div>
              <p className="note">
                Data source: The climate data used is from <a href="https://catalogue.ceda.ac.uk/uuid/8194b416cbee482b89e0dfbe17c5786c">CHESS-SCAPE</a>.
                Note that the UK average data is currently based on Scotland,
                Wales and England, and does not include Northern Ireland or all
                islands, as this is not available within the climate dataset.                
              </p>
            </div>
          </div>
        </div>

    );
}

export default Graph;
