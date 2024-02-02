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

function ClimateImpactSummary(props) {
    const [selectedPathway, setSelectedPathway] = useState(null);

    return (
        <LoadingOverlay active={props.loading} spinner text={"Loading climate data"}>
            <h1>Climate Impact Summary</h1>

            <p>
                Below are summaries of the impacts expected from the identified climate change impact pathways. These
                impacts will vary by area; however, the UK is likely to experience the following.
            </p>

            <p>
                You are viewing the impacts for&nbsp;
                <select onChange={(e) => setSelectedPathway(e.target.value)}>
                    <option value="Extreme Storms">Extreme Storms</option>
                    <option value="Coastal Security">Coastal Security</option>
                    <option value="Flooding and Drought">Flooding and Drought</option>
                    <option value="Food and Personal Security">Food and Personal Security</option>
                    <option value="Pathogenic Marine Microorganisms">Pathogenic Marine Microorganisms</option>
                    <option value="Temperature">Temperature</option>
                </select>
            </p>
        </LoadingOverlay>
    );
}

export default ClimateImpactSummary;
