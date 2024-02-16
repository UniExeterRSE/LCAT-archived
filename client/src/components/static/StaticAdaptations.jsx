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

import React from "react";
import LoadingOverlay from "react-loading-overlay";
import StaticAdaptation from "./StaticAdaptation";
import { pathways } from "../ClimateImpactSummaryData";

import adaptationData from "../../kumu/parsed/adaptation_data.json";

function StaticAdaptations(props) {
    const filteredAdaptations = adaptationData.filter((adaptation) => {
        const layers = adaptation.attributes.layer.map((layer) => layer.toLowerCase());
        return layers.some((layer) => layer.includes(props.selectedHazardName.toLowerCase() + " in full"));
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
