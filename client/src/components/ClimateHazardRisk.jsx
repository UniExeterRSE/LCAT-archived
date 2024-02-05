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
import { climateHazardsData } from "./ClimateHazardData";

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
                <div className="horiz-climate-container">
                    {climateHazardsData.map((hazard, index) => (
                        <div className="vert-container" key={index} onClick={() => handleHazardClick(hazard.name)}>
                            <p className="hazard-name">{hazard.name}</p>
                            {hazard.icon}
                        </div>
                    ))}
                </div>
            </div>

            {selectedHazard ? (
                <div className="selected-hazard-details">
                    <h2>{selectedHazard}</h2>
                    {climateHazardsData.find((hazard) => hazard.name === selectedHazard)?.details}
                </div>
            ) : (
                <div className="details-placeholder">
                    <p>Please click a climate hazard risk icon to view details.</p>
                </div>
            )}
        </LoadingOverlay>
    );
}

export default ClimateHazardRisk;
