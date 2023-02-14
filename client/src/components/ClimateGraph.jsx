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

// WHY are we writing our own graph in the presence of hundreds of js
// and react libraries in existence you ask? Because none (we have yet
// found) allow precice control of labelling of axes, scaling of data,
// font sizes and device independant viewing in a way that isn't
// faster to do directly in SVG

import React, { useState, useEffect } from 'react';
import { climateAverages } from '../core/climate';

const decades=["1980","2030","2040","2050","2060","2070"];
const graphWidth = 650;
const graphHeight = 270;
const selectedRegionCol = "#216331";
const averageRegionCol = "#48b961";

const labels = {
    "tas": 'Temperature (°C)',
    "pr": 'Rainfall (mm/day)',
    "sfcwind": 'Wind (m/s)',
    "rsds": 'Cloudiness (W/m²)'
};

const tickUnits = {
    "tas": 5,
    "pr": 1,
    "sfcwind": 2,
    "rsds": 50
};

const maximums = {
    "tas": 30,
    "pr": 6,
    "sfcwind": 8,
    "rsds": 250
};

function ClimateGraph(props) {
    const [data, setData] = useState([]);
    const [barWidth, setBarWidth] = useState(10);
    const [scale, setScale] = useState(10);
    const [ticks, setTicks] = useState([]);

    useEffect(() => {
        if (props.prediction.length>0) {
            setBarWidth(graphWidth/decades.length);
            
            // pull out the data for our variable ordered by the decades array
            let data=[];
            for (let n=0; n<decades.length; n++) {
                data.push(props.prediction[0][props.variable+"_"+decades[n]]);
            }
            setData(data);
            let scale = (graphHeight-50)/maximums[props.variable];
            setScale(scale);

            let ticks=[];
	        for (let i=0; i<=maximums[props.variable]; i+=tickUnits[props.variable]) {
                ticks.push({
                    x:60,
                    y:(graphHeight-i*scale),
                    v:i.toFixed()
                });
	        }
            setTicks(ticks);           
        }
    }, [props.prediction, props.variable]);
    
    return (
        <svg
          width="100%"
          height="50%"
          viewBox="0 0 800 300">         
          {data.map((v,i) => {
              let x=100+i*barWidth;
              let y=graphHeight;
              let h=v*scale;
                            
              if (props.showAverage) {
                  let variable=props.variable;
                  if (variable=="sfcwind") variable="sfcWind";
                  let avkey= "chess_scape_"+props.rcp+"_"+props.season+"_"+variable+"_"+decades[i];
                  let av = climateAverages[avkey];
                  let ah = av*scale;                  
                  return (
                      <g>
                        <rect x={x} y={y-h}
                              width={(barWidth/2)-2} height={h}
                              fill={averageRegionCol}/>
                        <text x={x+(barWidth/4)} y={y-h+15}
                              fill="#fff"                          
                              fontSize="15"
                              dominant-baseline="middle"
                              text-anchor="middle">
                          {v.toFixed(2)}
                        </text>
                        
                        <rect x={x+barWidth/2-2} y={y-ah}
                              width={(barWidth/2)-2} height={ah}
                              fill={selectedRegionCol}/>
                        <text x={x+(barWidth/2)-2+(barWidth/4)} y={y-ah+15}
                              fill="#fff"
                              fontSize="15"
                              dominant-baseline="middle"
                              text-anchor="middle">
                          {av.toFixed(2)}
                        </text>
                        
                        <text x={x+barWidth/2} y={y+20}
                              fill="#42273b"
                              fontSize="25"
                              dominant-baseline="middle"
                              text-anchor="middle">
                          {decades[i]}
                        </text>                    
                      </g>

                  );
              } else {              
                  return (
                      <g>
                        <rect x={x} y={y-h}
                              width={barWidth-2} height={h}
                              fill={selectedRegionCol}/>
                        <text x={x+barWidth/2} y={y-h+15}
                              fill="#fff"
                              fontSize="15"
                              dominant-baseline="middle"
                              text-anchor="middle" >
                          {v.toFixed(2)}
                        </text>
                                                
                        <text x={x+barWidth/2} y={y+20}
                              fill="#42273b"
                              fontSize="25"
                              dominant-baseline="middle"
                              text-anchor="middle">
                          {decades[i]}
                        </text>                    
                      </g>
                  );
              }
          })}
          
          {ticks.map((tick) => {
              return (
                  <text
                    x={tick.x} y={tick.y}
                    fontSize="15"
                    dominant-baseline="middle"
                    text-anchor="middle">
                    {tick.v}
                  </text>
              );
          })}
          
          
          <text
            x="0" y="0"
            fill="#42273b"
            fontSize="15"
            transform={"translate(30,"+(graphHeight/2)+") rotate(-90)"}
            dominant-baseline="middle"
            text-anchor="middle" >
            {labels[props.variable]}
          </text>
          
          <line
            x1="90"
            y1={graphHeight}
            x2="790"
            y2={graphHeight}
            stroke={"#000"}/>
          
          <line
            x1="90"
            y1={graphHeight}
            x2="90"
            y2="5"
            stroke={"#000"}/>
          
        </svg>
    );
}

export default ClimateGraph;
