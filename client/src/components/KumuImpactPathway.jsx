import React, { useState, useEffect } from "react";
import { useCollapse } from "react-collapsed";
import { pathways } from "./ClimateImpactSummaryData";

import "./KumuImpactPathway.css"

const KumuImpactPathway = (props) => {
    const [isExpanded, setExpanded] = useState(false);
    const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded });
    const pathwayMap = pathways.find((item) => item.name === props.selectedHazard).pathwayMap;

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
                        You are viewing the impacts for{" "}
                        <strong className="projected-regions">{props.selectedHazard}</strong>.
                    </p>
                    <div className="iframe-container">{pathwayMap}</div>
                </div>
            </div>
        </div>
    );
};

export default KumuImpactPathway;
