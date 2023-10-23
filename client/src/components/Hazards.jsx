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

import "./Hazards.css";

const hazardLabels = {
    coastal: "Coastal"
};

const hazardIcons = {
    coastal: "Coastal"
};

function Hazards(props) {
    
    const [ hazards, setHazards ] = useState([]);
    
    useEffect(() => {        
        setHazards([]);
        try {
            let prepend="";
            if (process.env.NODE_ENV==="development") {
                prepend="http://localhost:3000";
            }
            
            var url = prepend+"/api/hazards?"+
                new URLSearchParams({
                    boundary: props.regionType
                })+"&"+
                // clumsy, fixme
                new URLSearchParams(
                    props.regions.map(v => ["locations",v.id]));
            
            fetch(url).then(response => {
                response.json()
                    .then( v => {
                        let hazards = [];
                        for (let h of v) {
                            for (let k in h) {
                                // is this a hazard?
                                if (h[k]>0) {
                                    hazards.push({                                    
                                        label: hazardLabels[k],
                                        icon: lazy(() => import('../images/hazards/'+hazardIcons[k]))
                                    });
                                }
                            }
                        }
                        setHazards(hazards);
                    });
            });
        } catch(error) {
            console.error(error);
        }
    },[props.regionType,
       props.regions]);

    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (
        <LoadingOverlay
          active={props.loading}
          spinner
          text={'Loading hazard data'}>

          <div className={'title'}>              
            <h1>Environmental Vulnerabilities</h1>
            <div className="dropdown">
              <span className="caveat">Data quality</span>
	          <div className="dropdown-content">
                This data is proof of concept, only including whether an area is coastal or not, but it is up to date and reliable.
              </div>
            </div>
          </div>

          <p>
            Everywhere will be exposed to the impacts of climate change & extreme weather events but not everywhere will be effected equally.
            The information below shows which environmental hazards are present in your selected area/s of&nbsp;
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>
          </p>
          
          { hazards.length ?
            <div className={"container-hazards"}>
              <div className={"icon-container-hazards"}>        
                { hazards.map((hazard) => (
                    <div key={hazard.label} className={"hazard-icon"}>
                      <div className="health-img">
                        <Suspense fallback={<div>Loading icon...</div>}>
                          <hazard.icon/>
                        </Suspense>
                      </div>                
                      <div className="health-text">{hazard.label}</div>                 
                    </div>
                ))}
              </div>
              <div className={"text-container-hazards"}>
                <ul>
                  {/* todo: do click/update */}
                  <li><b>Climate related risk:</b> Coastal</li>
                  <li><b>Description:</b> Your selected area/s include coastal zones that are more at risk of climate change because...</li>
                  <li>
                    <b>Data source URL: </b>
                    <a href="https://zenodo.org/record/8154705" target="_">
                      Great Britain coastal areas (zenodo.org)
                    </a>
                  </li>
                </ul>            
              </div>
            </div>:<h3>No hazards found for { andify(props.regions.map(e => e.name)) }</h3> }

          <p className="note">
            Data source varies for each risk, please click on icons above for more information. 
          </p>
        </LoadingOverlay>
    );
}

export default Hazards;
