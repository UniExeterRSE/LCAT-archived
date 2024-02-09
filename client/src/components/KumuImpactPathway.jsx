import React, { useState, useEffect } from "react";
import { useCollapse } from "react-collapsed";
import { pathways } from "./ClimateImpactSummaryData";

import "./KumuImpactPathway.css";

const KumuImpactPathway = (props) => {
    const [isExpanded, setExpanded] = useState(false);
    const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded });
    const [whichPathway, setWhichPathway] = useState("summary");
    const pathway = pathways.find((item) => item.name === props.selectedHazardName);
    const pathwayMap = whichPathway === "summary" ? pathway.summaryPathwayMap : pathway.completePathwayMap;

    const togglePathway = () => {
        setWhichPathway(whichPathway === "summary" ? "complete" : "summary");
    };

    useEffect(() => setExpanded(false), [props.regions]);

    function handleOnClick() {
        setExpanded(!isExpanded);
    }

    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div className="collapsible">
            <div className="header" {...getToggleProps({ onClick: handleOnClick })}>
                {isExpanded ? "Hide" : "Explore"} climate impact details
            </div>
            <div {...getCollapseProps()}>
                <div className="content">
                    <h1>Climate Impact Details</h1>
                    <p>
                        The climate impact pathway below shows the direct and indirect impacts of climate change hazards
                        as understood through available evidence. These impacts are specific to the UK rather than your
                        selected area.
                    </p>
                    <p>
                        Both the nodes and the connections between them contain information. Clicking on the nodes will
                        show details for an impact. Clicking on the lines will show the relationship between impacts.
                    </p>
                    <p>
                        You are viewing the{" "}
                        <select value={whichPathway} onChange={togglePathway}>
                            <option value="summary">summary</option>
                            <option value="complete">complete</option>
                        </select>{" "}
                        climate impacts for{" "}
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
                    <div className="iframe-container">{pathwayMap}</div>
                </div>
            </div>
        </div>
    );
};

export default KumuImpactPathway;
