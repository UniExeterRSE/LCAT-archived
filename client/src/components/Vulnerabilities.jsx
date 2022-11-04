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

import React, { useEffect, useState, lazy, Suspense } from 'react';

import { andify } from '../utils/utils';
import { nfviColumns } from '../core/climatejust';
import LoadingOverlay from "react-loading-overlay";
import VulnerabilitiesLoader from './VulnerabilitiesLoader';
import { camelize } from '../utils/utils';

import './Vulnerabilities.css';

function Vulnerabilities(props) {

    const [ vulnerabilities, setVulnerabilities ] = useState([]);
    const [ decile, setDecile ] = useState("dec_1");
    const [ loading, setLoading ] = useState(false);
    const [ data, setData ] = useState([]);

    useEffect(() => {
        if (data.length>0) {
            let vulns = [];
            for (let key of Object.keys(nfviColumns)) {
                let avg = data[0][key];

                if (avg!=null) {
                
                    let statkey = props.regionType+"_vulnerabilities_"+key;
                    let comparison = props.stats[statkey+"_"+decile];

                    let significant = true;
                    if (comparison!=undefined) {                        
                        significant = false;
                        if (nfviColumns[key].direction=="less-than") {
                            comparison = props.stats[statkey+"_"+flipDecile(decile)];
                            if (avg<comparison) {
                                significant = true;
                            }
                        } else {
                            if (avg>comparison) {
                                significant = true;
                            }
                        }
                    }

                    if (key=="imd_decile") {
                        if (lessThanDecile(data[0][key],decile)) {                    
                            vulns.push({
                                key: key,
                                type: "UK/Welsh/Scottish government",
                                name: "Index of Multiple Deprivation (Decile: "+data[0][key].toFixed()+")",                        
                                region: 0,
                                uk: 0,
                                icon: lazy(() => import('../images/vulnerabilities/Imd')),
                            });
                        }
                    } else {                    
                        if (significant) {
                            vulns.push({
                                key: key,
                                type: "Climate JustNFVI) Supporting Variables",
                                name: nfviColumns[key].name,                        
                                region: data[0][key],
                                uk: props.stats[statkey+"_avg"],
                                icon: lazy(() => import('../images/vulnerabilities/'+camelize(key))),
                            });
                        }
                    }
                }
            }
            setVulnerabilities(vulns);        
        }
    }, [decile,data]);


    function lessThanDecile(v,decile) {
        if (decile=="dec_1") return v<1;
        if (decile=="dec_2") return v<2;
        if (decile=="dec_3") return v<3;
        if (decile=="dec_4") return v<4;
        if (decile=="dec_5") return v<5;
        if (decile=="dec_6") return v<6;
        if (decile=="dec_7") return v<7;
        if (decile=="dec_8") return v<8;
        return v<9;
    }

    
    function flipDecile(decile) {
        if (decile=="dec_1") return "dec_9";
        if (decile=="dec_2") return "dec_8";
        if (decile=="dec_3") return "dec_7";
        if (decile=="dec_4") return "dec_6";
        if (decile=="dec_5") return "dec_5";
        if (decile=="dec_6") return "dec_4";
        if (decile=="dec_7") return "dec_3";
        if (decile=="dec_8") return "dec_2";
        return "dec_1";
    }
    
    function decileToText(decile) {
        if (decile=="dec_1") return "10%";
        if (decile=="dec_2") return "20%";
        if (decile=="dec_3") return "30%";
        if (decile=="dec_4") return "40%";
        if (decile=="dec_5") return "50%";
        if (decile=="dec_6") return "60%";
        if (decile=="dec_7") return "70%";
        if (decile=="dec_8") return "80%";
        return "90%";
    }
        
    if (props.regions.length === 0) {
        return null;
    }

    return (
        <div>
          <VulnerabilitiesLoader 
            regions = {props.regions}
            regionType = {props.regionType}
            callback = {data => setData(data)}
            loadingCallback={ loading => { setLoading(loading); }}            
          />
                      
          <LoadingOverlay
            active={loading}
            spinner
            text={'Loading...'}>
            <h1>Vulnerabilities</h1>
            <p>
              The following vulnerabilities are particularly important in your selected area of&nbsp;              

              <span className={"projected-regions"}>
                { andify(props.regions.map(e => e.name)) }
              </span>
              
              .&nbsp;These vulnerabilities are in the top&nbsp;
              
              <select onChange={(e) => { setDecile(e.target.value); }}>
                <option value="dec_1">10%</option>
                <option value="dec_2">20%</option>
                <option value="dec_3">30%</option>
                <option value="dec_4">40%</option>
                <option value="dec_5">50%</option>
                <option value="dec_6">60%</option>
                <option value="dec_7">70%</option>
                <option value="dec_8">80%</option>
                <option value="dec_9">90%</option>
              </select>

              &nbsp;compared with UK averages:
            </p>
            
            <div className={"vuln-container"}>        
              {vulnerabilities.length ? vulnerabilities.map(
                  v => {
                      return (
                          <div key={v.name} className={"vuln"}>
                            <Suspense fallback={<div>Loading icon...</div>}>
                              <v.icon/>
                            </Suspense>
                            <div className={"vuln-name"}>{v.name}</div>                                                  
                            {!v.name.startsWith("Index") &&
                             <div className={"vuln-type"}>{v.region.toFixed(2)}% vs {v.uk.toFixed(2)}% UK average</div>
                            }
                          </div>
                      );
                  }) : <h3>{ andify(props.regions.map(e => e.name)) } is not in the top {decileToText(decile)} for any vulnerabilities.</h3>}
            </div>  
	        <p className="note">
              Data source: The vulnerability data comes from <a href="https://www.climatejust.org.uk">ClimateJust</a> and is based on 2011 census data. This will be updated once the 2021 census data is available.
	        </p>
          </LoadingOverlay>
        </div>
    );
}

export default Vulnerabilities;
