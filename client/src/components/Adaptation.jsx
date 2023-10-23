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

import { useCollapse } from 'react-collapsed';
import References from './References';

import "./Adaptation.css";

function Adaptation(props) {
    
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

    function fixesText(p) {
        let d = "Increases ";
        if (p.edge.type=="-") d="Decreases ";
        return d+p.node.label;
    }
    
    return (
        <div className="adaptation collapsible">
          <div className="adaptation header"  {...getToggleProps()}>
            {props.a.action.label}
            <div className={isExpanded ? "arrow down" : "arrow right"}/>
          </div>
          <div {...getCollapseProps()}>
            <div className="content">
              <b>Description:</b>
              <p>{props.a.action.description}</p>

              { props.a.parents.length>0 &&
                <div>
                  <b>Direct effects:</b>
                  <ul>
                    {props.a.parents.map(p => (
                        <li key={p.node.node_id}>{fixesText(p)}</li>
                    ))}
                  </ul>
                </div>
              }
              { props.a.healthnodes.length>0 &&
                <div>
                  <b>Alleviates these health impacts:</b>
                  <ul>
                    {props.a.healthnodes.map(p => (
                        <li key={p.node_id}>{p.label}</li>
                    ))}
                  </ul>
                </div>
              }
              { props.a.pressures.length>0 &&
                <div>
                  <b>Required due to these pressures:</b>
                  <ul>
                    {props.a.pressures.map(p => (
                        <li key={p.node_id}>{p.label}</li>
                    ))}
                  </ul>
                </div>
              }

              <References
                id={props.a.action.node_id}
                api_call={"node_references"}
              />

            </div>
          </div>
        </div>
    );
    
}

export default Adaptation;
