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

import { useEffect } from 'react';

function StatsLoader(props) {
    useEffect(() => {
        try {
            let prepend="";
            if (process.env.NODE_ENV==="development") {
                prepend="http://localhost:3000";
            }            
            fetch(prepend+"/api/stats").then(nodes_response => {
                nodes_response.json()
                    .then( stats => {
                        let statdict = {};
                        for (let stat of stats) {
                            statdict[stat.key]=stat.value;
                        }
                        props.callback(statdict);                    
                    });
            });
        } catch(error) {
            console.error(error);
        }
    },[props.id]);
    
    return null;
}

export default StatsLoader;
