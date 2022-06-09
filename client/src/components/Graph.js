// -*- mode: rjsx-mode;  -*-

import React, { Component, useEffect } from 'react';
import {XYPlot, XAxis, YAxis, VerticalBarSeries, makeWidthFlexible, LabelSeries} from 'react-vis';

import '../../node_modules/react-vis/dist/style.css';
import ModelLoader from './ModelLoader';
import './Graph.css';

const FlexibleXYPlot = makeWidthFlexible(XYPlot); 

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: "hadgem_rcp85_tavg_ann",
            data: [],
            labelData: []
        };
    }

    callback = (data) => {
        console.log("setting data");
        this.setState(() => ({
            data: data.map(v => ({x: v.year, y: v.avg})),
            labelData: data.map(v => ({x: v.year, y: v.avg+0}))
        }));        
    }
    
    render() {
        return (            
            <div>
              <h1>Graph</h1>
              <select onChange={(e) => { this.setState(() => ({
                  table: e.target.value                  
              }));}}>
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

              <ModelLoader
                regions={this.props.regions}
                table={this.state.table}
                region={this.props.region}
                callback={this.callback}
              />
              <FlexibleXYPlot height={300} xType="ordinal">
                <XAxis title="Year"/>
                { this.state.table.includes("rain") ? 
                  <YAxis title="Percent change"/> :
                  <YAxis title="Degrees change"/> }
                <VerticalBarSeries data={this.state.data} />
                <LabelSeries
                  data={this.state.labelData}
                  /*labelAnchorY = {"auto"}*/
                  labelAnchorX = {"middle"}
                  getLabel={(d) => {
                      return this.state.table.includes("rain") ?
                          d.y.toFixed(2)+'%' :
                          d.y.toFixed(2)+'°C';
                  }}/>
              </FlexibleXYPlot>
            </div>
        );
    }
}

export default Graph;
