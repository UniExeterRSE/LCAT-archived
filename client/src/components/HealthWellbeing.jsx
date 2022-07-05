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

import React, { useEffect, useState } from 'react';
import LoadingOverlay from "react-loading-overlay";

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import { NetworkParser } from '../core/NetworkParser';
import { andify } from '../utils/utils';

function HealthWellbeing(props) {

    const [ networkParser, setNetworkParser ] = useState(
        new NetworkParser(
            props.network.nodes,
            props.network.edges));

    useEffect(() => {
        setNetworkParser(new NetworkParser(
            props.network.nodes,
            props.network.edges));
    }, [props.network]);
    
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
            The climate change forecast in
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }.
            </span>

            is expected to cause these <span className={"nonsense"}>(nonsense test data)</span> health and wellbeing impacts:
          </p>
          
          <div className={"horiz-container"}>        
            { networkParser.calculateHealthWellbeing(
                props.climatePrediction,
                props.year,
                props.sector
            ).map((node) => (
                <div className={"vert-container"}>
                  <HealthAndWellbeingSvg/>
                  <center>
                    <p>
                      {node.title}
                      <br/>
                      <b>
                        {node.state.asText()}
                      </b>
                    </p>
                  </center>
                </div>
            )) }
          </div>  
        </LoadingOverlay>
    );
}

export default HealthWellbeing;
