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

import React, { useEffect, useState, lazy, Suspense } from 'react';
import LoadingOverlay from "react-loading-overlay";
import { NetworkParser } from '../core/NetworkParser';
import { andify, camelize, rcpText, seasonText } from '../utils/utils';

import './HealthWellbeing.css';

function HealthWellbeing(props) {

    const [ healthNodes, setHealthNodes ] = useState([]);

    useEffect(() => {
        let hw = props.networkParser.calculateHealthWellbeing(
            props.climatePrediction,
            props.year);

        // lazy load the icons here
        setHealthNodes(hw.map(node => {            
            node.direction = lazy(() => import('../images/'+node.state));
            node.icon = lazy(() => import('../images/health/'+camelize(node.label)));
            return node;
        }));

    }, [props.networkParser,
        props.climatePrediction,
        props.year]);
    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (
        <LoadingOverlay
          active={props.loading}
          spinner
          text={'Loading climate data'}>

          <h1>Health Impact Summary</h1>

          <p>
            The climate change in&nbsp;
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>

            &nbsp;under the <b>{rcpText[props.rcp]}</b> when considering <b>{seasonText[props.season]}</b> averages, is expected to result in these health and wellbeing impacts:
          </p>
          
          <div className={"horiz-container-health"}>        
            { healthNodes.length ? healthNodes.map((node) => (
                <div key={node.node_id} className={"vert-container-health"}>
                  <div className="direction-img">
                    <Suspense fallback={<div>Loading direction icon...</div>}>
                      <node.direction/>
                    </Suspense>
                  </div>
                  <div className="health-img">
                    <Suspense fallback={<div>Loading icon...</div>}>
                      <node.icon/>
                    </Suspense>
                  </div>                
                  <div className="health-text">{node.label} { node.state=="increase" ? "increasing" : "decreasing" }</div>                 
                </div>
            )):<h3>No health impacts found for { andify(props.regions.map(e => e.name)) }</h3> }
          </div>

          <p className="note">
            Data source: The impact data is based on published scientific
            literature and reports. <a href="https://docs.google.com/spreadsheets/d/1HRlKyfjhKSaOb8YlA4TI4TPfzlKmeQLhaHnmR4cGg2M/" target="_blank">A full reference list is available</a>, and the references relevant to particular impacts can be explored in the health impact details network.
          </p>
        </LoadingOverlay>
    );
}

export default HealthWellbeing;
