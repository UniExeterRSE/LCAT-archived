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

function Sector(props) {
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <p>
            You are currently viewing impacts in

            <select onChange={(e) => { props.callback(e.target.value); }}>
              <option value="all">All sectors</option>
              <option value="wildfowl">Wildfowl</option>
              <option value="confectionary">Confectionery</option>
            </select>
          </p>
        </div>
    );
}

export default Sector;
