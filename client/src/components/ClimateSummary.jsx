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
            
            <p className="note">
              Data source: The climate data used is from <a href="https://catalogue.ceda.ac.uk/uuid/8194b416cbee482b89e0dfbe17c5786c">CHESS-SCAPE</a>,
              RCP6.0 and 8.5 were selected on the advice of climate researchers
              and published literature <a href="https://www.unep.org/resources/emissions-gap-report-2022">existing policies point to a 2.8C temperature rise by 2100, in line with RCP6.0</a>.
              To improve relatability, the baseline used is quite recent (1980
              decade average), note that this does not fully reflect the extent
              of climate change since pre-industrial times.              
            </p>
          </div>
        </LoadingOverlay>        
    );
}

export default ClimateSummary;
