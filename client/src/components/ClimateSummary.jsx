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

import TempSvg from '../images/climate/Temperature';
import TempMinSvg from '../images/climate/TempMin';
import TempMaxSvg from '../images/climate/TempMax';
import RainSvg from '../images/climate/Rain';
import WindSvg from '../images/climate/WindSpeed';
import CloudSvg from '../images/climate/CloudCover';
import IncreaseSvg from '../images/increase';
import DecreaseSvg from '../images/decrease';

import { andify } from '../utils/utils';

import './ClimateSummary.css';

function climateChange(prediction,variable,year) {
    if (prediction.length>0) {
        if (prediction[0][variable+"_1980"]!=null) {
            let baseline = parseFloat(prediction[0][variable+"_1980"]);
            let predict = parseFloat(prediction[0][variable+"_"+year]);
            return predict-baseline;
        }
    }
    return null;
}

function arrow(prediction,year,variable) {
    let v = climateChange(prediction,variable,year);
    if (v==null) return null;
    // more radiation = less cloud
    if (variable=="rsds") { v=-v; }
    if (v<0) return <DecreaseSvg className="climate-arrow"/>;
    else return <IncreaseSvg className="climate-arrow"/>;
}

function predict(prediction,year,variable,name,units) {
    if (prediction.length>0) {
        let v=climateChange(prediction,variable,year);        
        if (v==null) return (<span>No data yet for this area, coming soon.</span>);
        let pv = Math.abs(v).toFixed(2);        
        if (variable=="rsds") { v=-v; }
        let dir = "increases";
        if (v<0) dir = "decreases";
        if (v==0) {
            return (<span>No change in {name}</span>);
        }
        return (<div className="summary-text">{name} {dir} by {pv} {units}</div>);        
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
          <div className="climate-summary">
            <div className="horiz-container">
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"tas")}
                <TempSvg className="climate-arrow"/>
                {predict(props.climatePrediction,
                         props.year,"tas","Temperature","°C")}
              </div>
              {/*
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"tasmin")}
                <TempMinSvg className="climate-arrow"/>
                {predict(props.climatePrediction,
                         props.year,"tasmin","Min Temperature","°C")}
              </div>
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"tasmax")}
                <TempMaxSvg className="climate-arrow"/>
                {predict(props.climatePrediction,
                         props.year,"tasmax","Max Temperature","°C")}
              </div>
              */}
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"pr")}
                <RainSvg className="climate-arrow"/>              
                {predict(props.climatePrediction,
                         props.year,"pr","Rainfall","mm/day")}
              </div>
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"rsds")}
                <CloudSvg className="climate-arrow"/>
                {predict(props.climatePrediction,
                         props.year,"rsds","Cloudiness","Watts/m2")}             
              </div>
              <div className="vert-container">
                {arrow(props.climatePrediction,props.year,"sfcwind")}
                <WindSvg className="climate-arrow"/>
                {predict(props.climatePrediction,
                         props.year,"sfcwind","Windiness","m/sec")}
              </div>

            </div>
            <p>
              Note: Yearly average climate change does not always reflect the extremes of summer and winter. Change the drop down menu above to see the predictions for the different seasons.
            </p>
            <p className="note">
              Data source: The climate data used is from <a href="https://catalogue.ceda.ac.uk/uuid/8194b416cbee482b89e0dfbe17c5786c" target="_blank">CHESS-SCAPE</a>,
              RCP6.0 and 8.5 were selected on the advice of climate researchers
              and published literature. <a href="https://www.unep.org/resources/emissions-gap-report-2022" target="_blank">Existing policies point to a 2.8C temperature rise by 2100, in line with RCP6.0</a>.
              To improve relatability, the baseline used is quite recent (1980
              decade average), note that this does not fully reflect the extent
              of climate change since pre-industrial times.              
              The CHESS-SCAPE dataset is produced by the UK Centre for Ecology
              & Hydrology (CEH) using four members of the MetOffice UKCP18
              regional projections. CEH adapted the Climate, Hydrology and
              Ecology research Support System (CHESS) downscaling methodology,
              taking into account topographic and observational data to
              downscale from 12km to 1km grid cells. We use the bias corrected
              datasets for RCP6.0 and 8.5.
            </p>
          </div>
        </LoadingOverlay>        
    );
}

export default ClimateSummary;
