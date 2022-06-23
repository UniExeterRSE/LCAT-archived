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

import { useEffect } from 'react';

function NetworkLoader(props) {
    useEffect(() => {
        try {
            let prepend="";
            if (process.env.NODE_ENV==="development") {
                prepend="http://localhost:3000";
            }            
            fetch(prepend+"/api/network_nodes").then(nodes_response => {
                nodes_response.json()
                    .then( nodes => {
                        fetch(prepend+"/api/network_edges").then(edges_response => {
                            edges_response.json()
                                .then( edges => {                         
                                    props.callback(nodes,edges);
                                });
                        });
                    });
            });
        } catch(error) {
            console.error(error);
        }
    },[props.id]);
    
    return null;
}

export default NetworkLoader;
