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

import React from "react";
import LoadingOverlay from "react-loading-overlay";

import HeatwaveSvg from '../images/hazards/Heatwave.js'
import WildfiresSvg from '../images/hazards/Wildfires.js'
import FloodSvg from '../images/hazards/Flood.js'
import AirPollutionSvg from '../images/hazards/AirPollution.js'
import CoastalErosionSvg from '../images/hazards/CoastalErosion.js'


import "./ClimateHazardRisk.css";

function ClimateHazardRisk(props) {
    return (
        <LoadingOverlay active={props.loading} spinner text={"Loading climate data"}>
            <h1>Climate Hazard Risk</h1>

            <p>
                The hazards of climate change will occur in many forms. These hazards pose higher risks in some areas
                than others. Exploring each icon will provide information about that climate hazard and links to
                relevant localised datasets.
            </p>

            <div className="climate-hazard">
                <div className="horiz-container">
                    <div className="vert-container">
                        <p>Heatwaves</p>
                        <HeatwaveSvg className="hazard-img"/>
                    </div>
                    <div className="vert-container">
                        <p>Wildfires</p>
                        <WildfiresSvg className="hazard-img" />
                    </div>
                    <div className="vert-container">
                        <p>Air Quality</p>
                        <AirPollutionSvg className="hazard-img" />
                    </div>
                    <div className="vert-container">
                        <p>Flooding</p>
                        <FloodSvg className="hazard-img" />
                    </div>
                    <div className="vert-container">
                        <p>Coastal Erosion</p>
                        <CoastalErosionSvg className="hazard-img" />
                    </div>
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default ClimateHazardRisk;
