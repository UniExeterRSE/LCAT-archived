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
import References from './References';

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
              <b>Description:</b>
              <p>{props.a.action.description}</p>
              <b>Directly effects:</b>
              <ul>
                {props.a.parents.map(
                    p => {
                        return (<li>{fixesText(p)}</li>);
                    })
                }
              </ul>
              <b>Alleviates these health impacts:</b>
              <ul>
                {props.a.healthnodes.map(
                    p => {
                        return (<li>{p.label}</li>);
                    })
                }
              </ul>
              <b>Required due to these pressures:</b>
              <ul>
                {props.a.pressures.map(
                    p => {
                        return (<li>{p.label}</li>);
                    })
                }
              </ul>

              <References
                id={props.a.action.node_id}
                api_call={"node_references"}
              />
              
              <h3>Metadata</h3>
              <small>
                <ul>
                  <li><b>Climate hazard:</b> {props.a.action.climate_hazard}</li> 
                  <li><b>Sector:</b> {props.a.action.sector}</li> 
                  <li><b>UN SDG:</b> {props.a.action.sdg}</li> 
                </ul>
              </small>
            </div>
          </div>
        </div>
    );
    
}

export default Adaptation;
