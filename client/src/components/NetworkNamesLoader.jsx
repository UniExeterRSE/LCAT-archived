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

function NetworkNamesLoader(props) {
//    console.log("NNL");

    useEffect(() => {
        try {
            let prepend="";
            if (process.env.NODE_ENV==="development") {
                prepend="http://localhost:3000";
            }
            console.log("calling names");
    
            fetch(prepend+"/api/networks").then(nodes_response => {
                nodes_response.json()
                    .then( names => {
                        console.log("loaded names");
                        props.callback(names);                   
                    });
            });
        } catch(error) {
            console.error(error);
        }
    },[]);
    
    return null;
}

export default NetworkNamesLoader;
