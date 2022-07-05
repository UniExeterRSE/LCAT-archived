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

import React, { useState } from 'react';
import {XYPlot, XAxis, YAxis, VerticalBarSeries, makeWidthFlexible, LabelSeries} from 'react-vis';
import useCollapse from 'react-collapsed';

import '../../node_modules/react-vis/dist/style.css';
import ModelLoader from './ModelLoader';
import './Graph.css';
import { andify } from '../utils/utils';

const FlexibleXYPlot = makeWidthFlexible(XYPlot); 
const winterCol = "#a4f9c8";
const summerCol = "#4c9f70";

function Graph(props) {

    const [table, setTable] = useState("hadgem_rcp85_tavg_ann");
    const [data, setData] = useState([]);
    const [labelData, setLabelData] = useState([]);
    
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
    
    const callback = (data) => {
        setData(data.map(v => ({x: v.year, y: v.avg})));
        setLabelData(data.map(v => ({x: v.year, y: v.avg+0})));
    };         
    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (            
        <div>
          <h1>Climate Graphs</h1>
          <p>
            The graph below shows the future climate change 
            expected in 
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }.
            </span>
            
            You are viewing 

            <select onChange={(e) => { setTable(e.target.value); }}>
              <option value="hadgem_rcp85_tavg_ann">Annual mean temp</option>
              <option value="hadgem_rcp85_tavg_djf">Winter mean temp</option>
              <option value="hadgem_rcp85_tavg_jja">Summer mean temp</option>
              <option value="hadgem_rcp85_tmax_ann">Annual max temp</option>
              <option value="hadgem_rcp85_tmax_djf">Winter max temp</option>
              <option value="hadgem_rcp85_tmax_jja">Summer max temp</option>
              <option value="hadgem_rcp85_tmin_ann">Annual min temp</option>
              <option value="hadgem_rcp85_tmin_djf">Winter min temp</option>
              <option value="hadgem_rcp85_tmin_jja">Summer min temp</option>
              <option value="hadgem_rcp85_rain_ann">Annual mean rain</option>
              <option value="hadgem_rcp85_rain_djf">Winter mean rain</option>
              <option value="hadgem_rcp85_rain_jja">Summer mean rain</option>
            </select>
          </p>
          <ModelLoader
            regions={props.regions}
            table={table}
            regionType={props.regionType}
            callback={callback}
          />
          <FlexibleXYPlot height={300} xType="ordinal" color={summerCol}>
            <XAxis title="Year"/>
            { table.includes("rain") ? 
              <YAxis title="Percent change"/> :
              <YAxis title="Degrees change"/> }
            <VerticalBarSeries
              animation
              data={data} />
            <LabelSeries
              animation
              data={labelData}
        /*labelAnchorY = {"auto"}*/
              labelAnchorX = {"middle"}
              getLabel={(d) => {
                  return table.includes("rain") ?
                      d.y.toFixed(2)+'%' :
                      d.y.toFixed(2)+'°C';
              }}/>
          </FlexibleXYPlot>

          <p>
            Climate model data from <a href="https://uk-cri.org/">Climate Risk Indicators</a>
          </p>
        </div>
    );
}

export default Graph;
