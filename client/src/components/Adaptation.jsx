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

import useCollapse from 'react-collapsed';

function Adaptation(props) {
    
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    function fixesText(p) {
        let d = "Increases ";
        if (p.edge.type=="-") d="Decreases ";
        return d+p.node.label;
    }
    
    return (
        <div className="collapsible">
          <div className="header"  {...getToggleProps()}>
            <h3>{props.a.action.label}</h3>
          </div>
          <div {...getCollapseProps()}>
            <div className="content">
              <ul>
                {props.a.parents.map(
                    p => {
                        return (<li>{fixesText(p)}</li>);
                    })
                }
              </ul>
              {props.a.action.description}
              <ul>
                <li>Climate hazard: {props.a.action.climate_hazard}</li> 
                <li>Sector: {props.a.action.sector}</li> 
                <li>UN SDG: {props.a.action.sdg}</li> 
              </ul>
            </div>
          </div>
        </div>
    );
    
}

export default Adaptation;
