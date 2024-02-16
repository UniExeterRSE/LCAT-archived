// Development before 2024 Copyright (C) Then Try This and University of Exeter
// Development from 2024 Copyright (C) University of Exeter

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
import StaticAdaptation from "./StaticAdaptation";
import { pathways } from "../ClimateImpactSummaryData";
import { CCCAdaptationThemes, IPCCCategories } from "./AdaptationCategories";

import adaptationData from "../../kumu/parsed/adaptation_data.json";

function StaticAdaptations(props) {
    const [CCCAdaptationTheme, setCCCAdaptationTheme] = useState("No filter applied");
    const [IPPCCategory, setIPPCCategory] = useState("No filter applied");

    const filteredAdaptations = adaptationData.filter((adaptation) => {
        const hazardName = props.selectedHazardName.toLowerCase();
        const layers = adaptation.attributes.layer.map((layer) => layer.toLowerCase());
        const cccThemes = adaptation.attributes["ccc adaptation theme"];

        if (CCCAdaptationTheme === "No filter applied") {
            return layers.some((layer) => layer.includes(hazardName + " in full"));
        } else {
            return (
                layers.some((layer) => layer.includes(hazardName + " in full")) &&
                cccThemes.includes(CCCAdaptationTheme)
            );
        }
    });

    if (!adaptationData) {
        return <div>Loading...</div>;
    }

    return (
        <LoadingOverlay active={props.loading} spinner text={"Loading adaptations"}>
            <h1>Adaptations</h1>

            <p>
                You are viewing the{" "}
                <strong className="text-emphasis">{filteredAdaptations.length} climate adaptations </strong> for&nbsp;
                <select
                    value={props.selectedHazardName}
                    onChange={(e) => {
                        props.hazardCallback(e.target.value);
                    }}
                >
                    {pathways.map((pathway) => (
                        <option value={pathway.name} key={pathway.id}>
                            {pathway.name}
                        </option>
                    ))}
                </select>
            </p>

            <p>Filter these adaptations further using the options below:</p>

            <ul>
                <li>
                    By the <strong className="text-emphasis"> Cornwall County Council </strong> adaptation themes:{" "}
                    <select
                        value={CCCAdaptationTheme}
                        onChange={(e) => {
                            setCCCAdaptationTheme(e.target.value);
                        }}
                    >
                        <option value="No filter applied">No filter applied</option>
                        {CCCAdaptationThemes.map((theme, index) => (
                            <option value={theme} key={index}>
                                {theme}
                            </option>
                        ))}
                    </select>
                </li>
            </ul>
            <ul>
                <li>
                    By the <strong className="text-emphasis"> Intergovernmental Panel on Climate Change </strong>{" "}
                    categories:{" "}
                    <select
                        value={IPPCCategory}
                        onChange={(e) => {
                            setIPPCCategory(e.target.value);
                        }}
                    >
                        <option value="No filter applied">No filter applied</option>
                        {IPCCCategories.map((theme, index) => (
                            <option value={theme} key={index}>
                                {theme}
                            </option>
                        ))}
                    </select>
                </li>
            </ul>

            <div>
                {filteredAdaptations.length ? (
                    filteredAdaptations.map((adaptation) => {
                        return <StaticAdaptation key={adaptation._id} adaptation={adaptation.attributes} />;
                    })
                ) : (
                    <h3>No adaptations found</h3>
                )}
            </div>

            <p className="note">
                Data source: The adaptation data is based on published scientific literature and reports. You can see
                the references used by expanding each adaptation.
            </p>
        </LoadingOverlay>
    );
}

export default StaticAdaptations;
