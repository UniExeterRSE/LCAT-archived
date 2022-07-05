
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
          <p>
            Calculate impacts below using 
            <select onChange={(e) => { props.averageCallback(e.target.value); }}>           
              <option value="ann">Yearly</option>
              <option value="djf">Winter</option>
              <option value="jja">Summer</option>
            </select>
            
            average predictions for year 
            
            <select onChange={(e) => { props.yearCallback(e.target.value); }}>                  
              <option value="1996">1996</option>
              <option value="2006">2006</option>
              <option value="2016">2016</option>
              <option value="2026">2026</option>
              <option value="2036">2036</option>
              <option value="2046">2046</option>
              <option value="2056">2056</option>
              <option value="2066">2066</option>
              <option value="2076">2076</option>
              <option selected value="2086">2086</option>
            </select>
          </p>
        </div>
    );
}

export default ClimateSettings;
