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
import { andify } from '../utils/utils';
import { NetworkParser } from '../core/NetworkParser.js';

function Adaptations(props) {

    const [ networkParser, setNetworkParser ] = useState(
        new NetworkParser(
            props.network.nodes,
            props.network.edges));

    const [ adaptations, setAdaptations ] = useState([]);

    useEffect(() => {
        setNetworkParser(new NetworkParser(
            props.network.nodes,
            props.network.edges));        

        let hw = networkParser.calculateHealthWellbeing(
            props.climatePrediction,
            props.year,
            props.sector,
            "All");
        console.log("--------------------------------------");
        setAdaptations(networkParser.extractAdaptations());
        console.log(adaptations);
    }, [props.network,
        props.climatePrediction,
        props.year,
        props.sector]);
           
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <h2>Adaptations</h2>
          <p>
            The following adaptations the most important to consider in&nbsp; 
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>
          </p>
          
          <div>        
            {adaptations.length ? adaptations.map(
                a => {
                    return (
                        <div>
                          <h3>{a.action.label}</h3>
                          <p>
                          {a.breadcrumbs.map(
                              b => {
                                  return (<div>
                                            {b.map(el => (<small> - {el.label}</small>))}
                                          <br/>
                                          </div>);
                              })
                          }
                          </p>
                          {a.action.description}
                          <ul>
                            <li>Climate hazard: {a.action.climate_hazard}</li> 
                            <li>Sector: {a.action.sector}</li> 
                            <li>UN SDG: {a.action.sdg}</li> 
                          </ul>
                        </div>                                             
                    );
                }) : <h3>No adaptations found</h3>}
          </div>  
        </div>
    );
}

export default Adaptations;
