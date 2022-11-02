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
import Adaptation from "./Adaptation";

function Adaptations(props) {

    const [ adaptations, setAdaptations ] = useState([]);

    useEffect(() => {
        console.log("Adaptations update");
        if (props.climatePrediction.length!=0) {
            let hw = props.networkParser.calculateHealthWellbeing(
                props.climatePrediction,
                props.year,
                "All");
            setAdaptations(props.networkParser.extractAdaptations());
        }
    }, [props.networkParser,
        props.network,
        props.climatePrediction,
        props.year]);
           
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <h1>Adaptations</h1>
          <p>
            Based on the expected climate change and the resulting impacts,
            the following adaptations should be considered.
            You are currently viewing adaptations for {props.season} and
            for all sectors in&nbsp;

            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>
          </p>
          
          <div>        
            {adaptations.length ? adaptations.map(
                a => {return (<div>
                                <Adaptation a = {a}/>
                              </div>);})
             : <h3>No adaptations found</h3>}
          </div>

          <p className="note">
            Data source: The adaptation data is based on published scientific literature and reports. You can see the references used by expanding each adaptation.
          </p>
        </div>
    );
}

export default Adaptations;
