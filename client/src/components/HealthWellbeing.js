// -*- mode: rjsx;  -*-
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

import React, { useEffect } from 'react';



function HealthWellbeing(props) {
    return (
        <div>
          <h1>Health and Wellbeing Summary</h1>
          
          { props.networkRenderer.calculateHealthWellbeing(
              props.climatePrediction,
              props.year).map((node) => (
                  <p>{node.title}:{node.state}</p>
              )) }
          
        </div>
    );
}

export default HealthWellbeing;
