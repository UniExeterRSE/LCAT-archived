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
import { ReactComponent as WindSvg } from '../images/wind.svg';
import { ReactComponent as CloudSvg } from '../images/cloud.svg';

import { andify } from '../utils/utils';

import './ClimateSummary.css';

function predict(prediction,year,variable,name,units) {
    if (prediction.length>0) {
        let baseline = parseFloat(prediction[0][variable+"_1980"]);
        let predict = parseFloat(prediction[0][variable+"_"+year]);
        let v=predict-baseline;
        let pv = Math.abs(v).toFixed(2);

        let dir = "+";
        if (v<0) dir = "-";

        if (variable=="rsds") {
            // invert radiation to figure out cloudiness
            v=-v;
        }
        
        if (v==0) {
            return (<span>No change in {name}</span>);
        }
        if (v>0) {
            return (<span>Increased {name}<br/><small>{dir} {pv} {units}</small></span>);
        } else {               
            return (<span>Decreased {name}<br/><small>{dir} {pv} {units}</small></span>);
        }
    }
    return "Not loaded yet";
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
            <p>
              The climate forecast in&nbsp;

              <span className={"projected-regions"}>
                { andify(props.regions.map(e => e.name)) }
              </span>
              
              &nbsp;by { props.year } is          
            </p>
            <div className={"horiz-container"}>
              <div className={"vert-container"}>
                <TempSvg/>
                <p>
                  {predict(props.climatePrediction,
                           props.year,"tas","Temperature","°C")}
                </p>
              </div>
              <div className={"vert-container"}>
                <RainSvg/>              
                <p>
                  {predict(props.climatePrediction,
                           props.year,"pr","Rainfall","mm/year")}
                </p>
              </div>
              <div className={"vert-container"}>
                <CloudSvg/>
                <p>
                  {predict(props.climatePrediction,
                           props.year,"rsds","Cloudiness","Watts/m2")}
                </p>
              </div>
              <div className={"vert-container"}>
                <WindSvg/>
                <p>
                  {predict(props.climatePrediction,
                           props.year,"sfcwind","Windiness","m/sec")}
                </p>
              </div>

            </div>
          </div>
        </LoadingOverlay>        
    );
}

export default ClimateSummary;
