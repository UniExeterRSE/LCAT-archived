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
import { andify, rcpText, seasonText } from '../utils/utils';
import { NetworkParser } from '../core/NetworkParser.js';
import Adaptation from "./Adaptation";

function Adaptations(props) {

    const [ adaptations, setAdaptations ] = useState([]);
    const [ sector, setSector ] = useState("All");
    
    useEffect(() => {
        if (props.climatePrediction.length!=0) {
            let hw = props.networkParser.calculateHealthWellbeing(
                props.climatePrediction,
                props.year);
            setAdaptations(props.networkParser.extractAdaptations(sector));
        }
    }, [props.networkParser,
        props.network,
        props.climatePrediction,
        props.year,
        sector]);
           
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <div className={'title'}>              
            <h1>Adaptations</h1>
            <div className="dropdown">
              <span className="caveat">Data quality</span>
	          <div className="dropdown-content">
                This data is ok to use, but the adaptations may not be the best for your area
              </div>
            </div>
          </div>
          <p>
            Based on the expected climate change and the resulting impacts in&nbsp;

            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }
            </span>

            ,&nbsp;under the <b>{rcpText[props.rcp]}</b> when considering <b>{seasonText[props.season]}</b> averages,
            the following adaptations should be considered.
            You are currently viewing adaptations for&nbsp;
            
            <select onChange={(e) => setSector(e.target.value)} >
              <option value="All">All sectors</option>
              <option value="Health & Social Care">Health & Social Care</option>
              <option value="Biodiversity & Natural Habitats">Biodiversity & Natural Habitats</option>
              <option value="Water Supply & Quality">Water Supply & Quality</option>
              <option value="Education Services">Education Services</option>
              <option value="Transport">Transport</option>
              <option value="Energy Supply & Demand">Energy Supply & Demand</option>
              <option value="Business & Industry">Business & Industry</option>
              <option value="Information & Communication Technology">Information & Communication Technology</option>
              <option value="International Factors">International Factors</option>                  
            </select>
          </p>
          
          <div>        
            {adaptations.length ? adaptations.map(
                a => {return (<Adaptation key={a.action.node_id} a = {a}/>);})
             : <h3>No adaptations found</h3>}
          </div>

          <p className="note">
            Data source: The adaptation data is based on published scientific literature and reports. You can see the references used by expanding each adaptation.
          </p>
        </div>
    );
}

export default Adaptations;
