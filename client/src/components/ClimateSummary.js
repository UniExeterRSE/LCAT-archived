// -*- mode: rjsx;  -*-
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
        
    return "Error";
}

function ClimateSummary(props) {
    return (
        <div>
          <h1>Climate Summary</h1>
          <p>
            The climate forcast in

            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }.
            </span>
            
            by { props.year } is          
          </p>
          
          <TempSvg/>

          <p>
            {predict(props.climatePrediction,
                     props.year,"tavg_median","Temperature","°C")}
          </p>
          <RainSvg/>
          
          <p>
            {predict(props.climatePrediction,
                     props.year,"rain_median","Rainfall","%")}
          </p>
        </div>
    );
}

export default ClimateSummary;
