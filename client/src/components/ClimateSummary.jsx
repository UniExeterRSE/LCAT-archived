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

import LoadingOverlay from "react-loading-overlay";

import { ReactComponent as TempSvg } from '../images/temp.svg';
import { ReactComponent as RainSvg } from '../images/rain.svg';

import { andify } from '../utils/utils';

function predict(prediction,year,variable,name,units) {
    let v = 0;
    for (let p of prediction) {
        if (p.year==year) {
            v = p[variable].toFixed(2);
        }
    }
    if (v==0) {
        return "No change in "+name;
    }
    if (v>0) {
        return "Increased "+name+" ("+v+" "+units+")";
    } else {               
        return "Decreased "+name+" ("+v+" "+units+")";
    }
}

function ClimateSummary(props) {
    if (props.regions.length === 0) {
        return null;
    }
    return (
        <LoadingOverlay
          active={props.loading}
          spinner
          text={'Loading climate data'}>
          <div>
            <h1>Climate Summary</h1>
            <p>
              The climate forecast in

              <span className={"projected-regions"}>
                { andify(props.regions.map(e => e.name)) }.
              </span>
              
              by { props.year } is          
            </p>
            <div className={"horiz-container"}>
              <div className={"vert-container"}>
                <TempSvg/>
                <p>
                  {predict(props.climatePrediction,
                           props.year,"tavg_median","Temperature","°C")}
                </p>
              </div>
              <div className={"vert-container"}>
                <RainSvg/>              
                <p>
                  {predict(props.climatePrediction,
                           props.year,"rain_median","Rainfall","%")}
                </p>
              </div>
            </div>
          </div>
        </LoadingOverlay>        
    );
}

export default ClimateSummary;
