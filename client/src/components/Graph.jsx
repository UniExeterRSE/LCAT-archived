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

import React, { useState, useEffect } from 'react';
import { useCollapse } from 'react-collapsed';
import ClimatePredictionLoader from './ClimatePredictionLoader';
import ClimateGraph from './ClimateGraph';

import ModelLoader from './ModelLoader';
import './Graph.css';
import { andify } from '../utils/utils';

function Graph(props) {
    
    const [showAverage, setShowAverage] = useState(false);
    const [season,setSeason] = useState("annual");
    const [rcp,setRcp] = useState("rcp60");
    const [variable,setVariable] = useState("tas");
    const [prediction,setPrediction] = useState([]);
    
    const [ isExpanded, setExpanded ] = useState(false);
    const { getCollapseProps, getToggleProps } = useCollapse({isExpanded});

    // change when settings change
    useEffect(() => { setRcp(props.rcp); }, [props.rcp]);
    useEffect(() => { setSeason(props.season); }, [props.season]);        
    useEffect(() => setExpanded(false), [props.regions]);

    function handleOnClick() {
        setExpanded(!isExpanded);
    }
    
    if (props.regions.length === 0) {
        return null;
    }
    
    return (        
        <div className="collapsible">
          <div className="header" {...getToggleProps({onClick: handleOnClick})}>
            {isExpanded ? 'Hide' : 'Explore'} climate details 
          </div>
          <div {...getCollapseProps()}>

            <ClimatePredictionLoader
              regions = {props.regions}
              regionType = {props.boundary}
              season = {season}
              rcp = {rcp}
              callback = {(prediction) => setPrediction(prediction)}
              loadingCallback={ loading => { }}
            />
            
            <div className="content">
              <h1>Climate details</h1>
              <p>
                The graph below shows the future climate change 
                expected in&nbsp; 
                
                <span className={"projected-regions"}>
                  { andify(props.regions.map(e => e.name)) }
                </span>

                &nbsp;under&nbsp;
                
                <select value={rcp} onChange={(e) => {
                    setRcp(e.target.value);
                    props.rcpCallback(e.target.value);
                }}>           
                  <option value="rcp60">existing global policies</option>
                  <option value="rcp85">worst case scenario</option>
                </select>

                &nbsp;

                {rcp=="rcp60" && <span>(equivalent to global warming level of 2.0-3.7C which is RCP 6.0)</span>}
                {rcp=="rcp85" && <span>(equivalent to global warming level of 3.2-5.4C which is RCP 8.5)</span>}
                
                ,&nbsp;and shows the&nbsp;

                <select value={season} onChange={(e) => {
                    setSeason(e.target.value);
                    props.seasonCallback(e.target.value);
                }}>           
                  <option value="annual">yearly</option>
                  <option value="summer">summer</option>
                  <option value="winter">winter</option>
                </select>

                &nbsp;averages for&nbsp; 

                <select onChange={(e) => { setVariable(e.target.value); }}>
                  <option value="tas">temperature</option>
                  <option value="tasmin">min temperature</option>
                  <option value="tasmax">max temperature</option>
                  <option value="pr">rain</option>
                  <option value="sfcwind">wind</option>
                  <option value="rsds">cloudiness</option>
                </select>

                &nbsp;for your&nbsp; 
                
                <select onChange={(e) => { setShowAverage(e.target.value==="1"); }}>
                  <option value="0">selected areas only</option>
                  <option value="1">your areas vs the UK</option>
                </select>

                &nbsp;
                
                { showAverage && 
                  <p>
                    Key: <span className="key-regional">Your area</span> <span className="key-average">UK average</span>
                  </p>
                }        
              </p>

              <div className="graph-horiz-container">
                <ClimateGraph
                  prediction={prediction}
                  variable={variable}
                  showAverage={showAverage}
                  rcp={rcp}
                  season={season}
                />
              </div>
              {/* <div className="graph-x-axis">Decades</div> */}
              <p className="note">
                Data source: The climate data used is from <a href="https://catalogue.ceda.ac.uk/uuid/8194b416cbee482b89e0dfbe17c5786c" target="_blank">CHESS-SCAPE</a>.
                Note that the UK average data is currently based on Scotland,
                Wales and England, and does not include Northern Ireland or all
                islands, as this is not available within the climate dataset.                
              </p>
            </div>
          </div>
        </div>

    );
}

export default Graph;
