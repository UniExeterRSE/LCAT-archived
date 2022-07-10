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

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import { andify } from '../utils/utils';

function Vulnerabilities(props) {

    const [ regionIMDStatus, setRegionIMDStatus ] = useState("None");

    useEffect(() => {
        console.log(props.regions);
        if (props.regions.length>0) {
            let uk_avg = props.stats[props.regionType+"_imd_avg"];
            if (uk_avg!=undefined) {
                let regions_avg = props.regions.reduce((acc,region) => acc+region.imdscore,0);
                regions_avg/=props.regions.length;
                if (regions_avg>uk_avg) {
                    setRegionIMDStatus("Higher than UK average");
                } else {
                    setRegionIMDStatus("Lower than UK average");
                }
            }
        }
    }, [props.regions,
        props.stats,
        props.regionType]);

        
    if (props.regions.length === 0) {
        return null;
    }
    
    return (
        <div>
          <h1>Vulnerabilities</h1>

          <p>
            The following vulnerabilities are particularly important in
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }.
            </span>
            
            as they are above uk averages:
          </p>
          
          <div className={"horiz-container"}>        
            <div className={"vert-container"}>
              <HealthAndWellbeingSvg/>
              <center>
                <p>
                  Index of Multiple Deprivation
                  <br/>
                  <b>
                    {regionIMDStatus}
                  </b>
                </p>
              </center>
            </div>
          </div>  
        </div>
    );
}

export default Vulnerabilities;
