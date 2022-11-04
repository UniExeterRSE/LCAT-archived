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
import {XYPlot, XAxis, YAxis, VerticalBarSeries, makeWidthFlexible,
        LabelSeries, ChartLabel} from 'react-vis';
import useCollapse from 'react-collapsed';
import ClimatePredictionLoader from './ClimatePredictionLoader';

import '../../node_modules/react-vis/dist/style.css';
import ModelLoader from './ModelLoader';
import './Graph.css';
import { andify } from '../utils/utils';
import { climateAverages } from '../core/climate';

const FlexibleXYPlot = makeWidthFlexible(XYPlot); 
const winterCol = "#a4f9c8";
const summerCol = "#4c9f70";
const selectedRegionCol = "#216331";
const averageRegionCol = "#48b961";

function Graph(props) {

    const [data, setData] = useState([]);
    const [avg, setAvg] = useState([]);
    const [labelData, setLabelData] = useState([]);
    const [avgLabel, setAvgLabel] = useState([]);
    const [showAverage, setShowAverage] = useState(false);
    
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
        if (prediction.length>0) {
            let out = [];
            let label = [];
            let av = [];
            let avlabel = [];
            if (prediction[0][variable+"_1980"]!=null) {            
                for (let year of ["1980","2030","2040","2050","2060","2070"]) {
                    let label_year = year;
                    let v = variable;
                    if (v == "sfcwind") v="sfcWind";
                    let avkey= "chess_scape_"+rcp+"_"+season+"_"+v+"_"+year;
                    if (year=="1980") label_year="1980 baseline";

                    // seems that react-vis is incapable of positioning
                    // labels on bars when multiple barseries are used?
                    let offset=0;
                    if (showAverage) offset={pr:5,tas:10,sfcwind:10,rsds:5}[variable];

                    out.push({x: label_year, y:prediction[0][variable+"_"+year]});
                    label.push({x: label_year, y:prediction[0][variable+"_"+year], xOffset: -offset, yOffset: 0});

                    av.push({x: label_year, y:climateAverages[avkey]});
                    avlabel.push({x: label_year, y:climateAverages[avkey], xOffset: offset, yOffset: 0});

                }
                setAvg(av);
                setAvgLabel(avlabel);
                setData(out);
                setLabelData(label);
            }
        }
    }, [prediction,
        showAverage,
        variable]);         
    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (        
        <div className="collapsible">
          <div className="header" {...getToggleProps()}>
            {isExpanded ? 'Hide' : 'Explore'} climate details 
          </div>
          <div {...getCollapseProps()}>

              <ClimatePredictionLoader
                regions = {props.regions}
                regionType = {props.boundary}
                average = {season}
                rcp = {rcp}
                callback = {(prediction) => setPrediction(prediction)}
                loadingCallback={ loading => { }}
              />

            
            <div className="content">
              <h1>Climate details</h1>
              <p>
                The graph below shows the future climate change 
                expected in&nbsp; 
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>
                
                .&nbsp;You are viewing the&nbsp;

                <select onChange={(e) => { setSeason(e.target.value); }}>           
                  <option value="annual">yearly averages</option>
                  <option value="summer">summer averages</option>
                  <option value="winter">winter averages</option>
                </select>

                &nbsp;for&nbsp; 

                <select onChange={(e) => { setVariable(e.target.value); }}>
                  <option value="tas">temperature</option>
                  <option value="pr">rain</option>
                  <option value="sfcwind">wind</option>
                  <option value="rsds">cloudiness</option>
                </select>

                &nbsp;under the&nbsp; 
                
                <select onChange={(e) => { setRcp(e.target.value); }}>           
                  <option value="rcp60">existing global policies</option>
                  <option value="rcp85">worst case scenario</option>
                </select>

                &nbsp;
                
                {rcp=="rcp60" && <span>(equivalent to global warming level of 2.0-3.7C which is RCP 6.0)</span>}
                {rcp=="rcp85" && <span>(equivalent to global warming level of 3.2-5.4C which is RCP 8.5)</span>}.

                &nbsp;You are viewing&nbsp;
                
                <select onChange={(e) => { setShowAverage(e.target.value==="1"); }}>
                  <option value="0">your local climate change</option>
                  <option value="1">comparison with UK averages</option>
                </select>
                
                
              </p>

              <div className="graph-horiz-container">
                <FlexibleXYPlot
                  height={300}
                  margin={{bottom: 80, left: 100, right: 0, top: 10}}
                  xType="ordinal">
                  <ChartLabel
                    text="Decades"
                    className="graph-axes-label"
                    includeMargin={false}
                    xPercent={0.45}
                    yPercent={1.3}
                  />
                  <ChartLabel
                    text={getYAxis()}
                    className="graph-axes-label"
                    includeMargin={false}
                    xPercent={-0.05}
                    yPercent={0.25}
                    style={{
                        transform: 'rotate(-90)',
                        textAnchor: 'end'
                    }}
                  />
                  <XAxis/>
                  <YAxis/>
                  <VerticalBarSeries
                    color={selectedRegionCol}
                    animation
                    data={data} />
                  <LabelSeries
                    animation
                    data={labelData}
                    labelAnchorX = {showAverage ? "end" : "middle"}
                    getLabel={(d) => getLabel(d.y)}/>
                  { showAverage &&  
                    <VerticalBarSeries
                      color={averageRegionCol}
                      animation
                      data={avg} /> }
                  { showAverage && 
                    <LabelSeries
                      animation
                      data={avgLabel}
                      labelAnchorX = {"right"}
                      getLabel={(d) => getLabel(d.y)}/> }
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
