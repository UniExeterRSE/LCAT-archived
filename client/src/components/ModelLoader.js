import React, { Component, useEffect } from 'react';

function ModelLoader(props) {
    async function getModel() {
        if (props.regions.length>0) {
            try {
                var url = "http://localhost:3000/api/hadgem_rpc85?"+
                    new URLSearchParams({          
                        table: props.table,
                        region: props.region
                    })+"&"+
                    new URLSearchParams(
                        props.regions.map(v => ["locations",v]));

                console.log(url);
                
                let response = await fetch(url);
                response.json()
                    .then( v => {
                        props.callback(v);
                    });
            } catch(error) {
                console.error(error);
            }
        }
    }
    
    useEffect(() => {
        getModel();
    },[props.regions,
       props.table,
       props.region]);

    return null;
}

export default ModelLoader;
