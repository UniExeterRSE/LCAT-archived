// -*- mode: rjsx;  -*-
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

function ClimateSummary(props) {
    return (
        <div>
          <h1>Climate Summary</h1>
          { props.network.nodes.map((node) => {
              return (<p>{node.title}</p>);
          })}
        </div>
    );
}

export default ClimateSummary;
