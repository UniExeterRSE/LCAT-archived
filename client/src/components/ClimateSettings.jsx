
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

function ClimateSettings(props) {
    if (props.regions.length === 0) {
        return null;
    }
            
    return (
        <div>
          <h1>Climate Summary</h1>
          <p>
            Calculate impacts below using

            <select onChange={(e) => { props.rcpCallback(e.target.value); }}>           
              <option value="rcp60">RCP 6.0</option>
              <option value="rcp85">RCP 8.5</option>
            </select>

            seasonal average
            
            <select onChange={(e) => { props.averageCallback(e.target.value); }}>           
              <option value="winter">Winter</option>
              <option value="annual">Yearly</option>
              <option value="summer">Summer</option>
            </select>
            
            predictions for the decade  
            
            <select onChange={(e) => { props.yearCallback(e.target.value); }}>                  
              <option value="2020">2020's</option>
              <option value="2030">2030's</option>
              <option value="2040">2040's</option>
              <option value="2050">2050's</option>
              <option value="2060">2060's</option>
              <option selected value="2070">2070's</option>
            </select>

            compared with the baseline climate records for the 1980's.
            
          </p>
        </div>
    );
}

export default ClimateSettings;
