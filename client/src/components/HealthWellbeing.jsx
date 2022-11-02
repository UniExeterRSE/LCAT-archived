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

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import { NetworkParser } from '../core/NetworkParser';
import { andify } from '../utils/utils';

function HealthWellbeing(props) {

    const [ healthNodes, setHealthNodes ] = useState([]);

    useEffect(() => {
        console.log("HWB update");

        let hw = props.networkParser.calculateHealthWellbeing(
            props.climatePrediction,
            props.year,
            "All");

        // lazy load the icons here
        setHealthNodes(hw.map(node => {
            node.icon = lazy(() => import('../icons/health/'+node.label));
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
            The climate change predicted in your selected areas of&nbsp;
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>

            &nbsp;is expected to result in these health and wellbeing impacts:
          </p>
          
          <div className={"horiz-container-health"}>        
            { healthNodes.map((node) => (
                <div className={"vert-container-health"}>
                  <div className={"health-img"}>
                    <Suspense fallback={<div>Loading icon...</div>}>
                      <node.icon/>
                    </Suspense>
                  </div>                
                  {node.label}                  
                  <b>
                    {node.state}
                  </b>                
                </div>
            ))}
          </div>

          <p className="note">
            Data source: The impact data is based on published scientific literature and reports. A full reference list is available here, and the references relevant to particular impacts can be explored in the health impact details network.
          </p>
        </LoadingOverlay>
    );
}

export default HealthWellbeing;
