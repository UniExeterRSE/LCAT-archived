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

import React, { useState } from "react";
import LoadingOverlay from "react-loading-overlay";

import HeatwaveSvg from "../images/hazards/Heatwave.js";
import WildfiresSvg from "../images/hazards/Wildfires.js";
import FloodSvg from "../images/hazards/Flood.js";
import AirPollutionSvg from "../images/hazards/AirPollution.js";
import CoastalErosionSvg from "../images/hazards/CoastalErosion.js";

import "./ClimateHazardRisk.css";

function ClimateHazardRisk(props) {
    const [selectedHazard, setSelectedHazard] = useState(null);

    const handleHazardClick = (hazard) => {
        setSelectedHazard(hazard);
    };

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
                        <p className="hazard-name">Heatwaves</p>
                        <HeatwaveSvg className="hazard-img" onClick={() => handleHazardClick("Heatwaves")} />
                    </div>
                    <div className="vert-container">
                        <p className="hazard-name">Wildfires</p>
                        <WildfiresSvg className="hazard-img" onClick={() => handleHazardClick("Wildfires")} />
                    </div>
                    <div className="vert-container">
                        <p className="hazard-name">Air Quality</p>
                        <AirPollutionSvg className="hazard-img" onClick={() => handleHazardClick("Air Quality")} />
                    </div>
                    <div className="vert-container">
                        <p className="hazard-name">Flooding</p>
                        <FloodSvg className="hazard-img" onClick={() => handleHazardClick("Flooding")} />
                    </div>
                    <div className="vert-container">
                        <p className="hazard-name">Coastal Erosion</p>
                        <CoastalErosionSvg
                            className="hazard-img"
                            onClick={() => handleHazardClick("Coastal Erosion")}
                        />
                    </div>
                </div>
                {selectedHazard ? (
                    <div className="selected-hazard-details">
                        <h2>{selectedHazard}</h2>
                        <p>Additional text for {selectedHazard}</p>
                    </div>
                ) : (
                    <div className="details-placeholder">
                        <p>Please click a climate hazard risk icon to view details.</p>
                    </div>
                )}
            </div>
        </LoadingOverlay>
    );
}

export default ClimateHazardRisk;
