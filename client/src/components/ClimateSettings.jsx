
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
import { andify } from '../utils/utils';

function ClimateSettings(props) {
    const [rcp, setRcp] = useState("rcp60");
    
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <h1>Climate Summary</h1>
          <p>
            You have selected&nbsp;

            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>

            &nbsp;For this area under the
            
            <select onChange={(e) => { setRcp(e.target.value); props.rcpCallback(e.target.value); }}>           
              <option value="rcp60">existing global policies</option>
              <option value="rcp85">worst case scenario</option>
            </select>

            {rcp=="rcp60" && <span>(equivalent to global warming level of 2.0-3.7C which is RCP 6.0)</span>}
            {rcp=="rcp85" && <span>(equivalent to global warming level of 3.2-5.4C which is RCP 8.5)</span>}
            
            &nbsp;the
            
            <select onChange={(e) => { props.averageCallback(e.target.value); }}>           
              <option value="annual">yearly average</option>
              <option value="summer">summer average</option>
              <option value="winter">winter average</option>
            </select>
            
            climate change for the  
            
            <select onChange={(e) => { props.yearCallback(e.target.value); }}>                  
              <option value="2030">2030</option>
              <option value="2040">2040</option>
              <option value="2050">2050</option>
              <option value="2060">2060</option>
              <option selected value="2070">2070</option>
            </select>

            decade compared with the local climate records for the 1980s.

            <p>
              Notice that the yearly average climate change does not always reflect the extremes of summer and winter, so it is worth changing the drop down menu above to see the predictions for the different seasons. 
            </p>
            
          </p>
        </div>
    );
}

export default ClimateSettings;
