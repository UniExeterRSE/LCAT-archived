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
import { impacts, communityImpacts, pathways } from "./ClimateImpactSummaryData";

import "./ClimateImpactSummary.css";

function ClimateImpactSummary(props) {
    const selectedPathwayData = pathways.find((item) => item.name === props.selectedHazardName);
    const filteredImpacts = impacts.filter((item) => item.inPathway.includes(selectedPathwayData.id));
    const filteredCommunityImpacts = communityImpacts.filter((item) => item.inPathway.includes(selectedPathwayData.id));

    return (
        <LoadingOverlay active={props.loading} spinner text={"Loading impact summaries"}>
            <h1>Climate Impact Summary</h1>

            <p>
                Below are summaries of the impacts expected from the identified climate change impact pathways. These
                impacts will vary by area; however, the UK is likely to experience the following.
            </p>

            <p>
                You are viewing the climate impacts for&nbsp;
                <select
                    value={props.selectedHazardName}
                    onChange={(e) => {
                        props.hazardCallback(e.target.value);
                    }}
                >
                    {pathways.map((pathway) => (
                        <option key={pathway.id} value={pathway.name}>
                            {pathway.name}
                        </option>
                    ))}
                </select>
            </p>

            <h2 className="health-impact-summary">Health impact summary</h2>

            <p>
                The health impact summary shows the health effects for each climate impact pathway and is adapted from
                the WHO climate-sensitive health risks guidelines. You are viewing the climate impacts for{" "}
                <strong className="projected-regions">{props.selectedHazardName}</strong>.
            </p>

            <div className="horiz-container-impact">
                {filteredImpacts.map((impact) => (
                    <div className="vert-container-impact">
                        <div className="impact-img">{impact.icon}</div>
                        <div className="impact-text">{impact.name}</div>
                    </div>
                ))}
            </div>

            <h2 className="community-impact-summary">Community Impact Summary</h2>

            <p>
                The community impact summary displays the main impacts from climate change in the UK based on your
                selected climate impact pathway. You are viewing the climate impacts for{" "}
                <strong className="projected-regions">{props.selectedHazardName}</strong>.
            </p>

            <div className="horiz-container-impact">
                {filteredCommunityImpacts.map((impact) => (
                    <div className="vert-container-impact">
                        <div className="impact-img">{impact.icon}</div>
                        <div className="impact-text">{impact.name}</div>
                    </div>
                ))}
            </div>
        </LoadingOverlay>
    );
}

export default ClimateImpactSummary;
