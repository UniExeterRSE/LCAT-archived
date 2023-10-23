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
import { decileToNumber, flipDecile, decileToText } from '../utils/decile'; 
import './Vulnerabilities.css';

function Vulnerabilities(props) {

    const [ vulnerabilities, setVulnerabilities ] = useState([]);
    const [ decile, setDecile ] = useState("dec_2");
    const [ loading, setLoading ] = useState(false);
    const [ data, setData ] = useState([]);

    useEffect(() => {
        if (data.length>0) {
            let vulns = [];
            for (let key of Object.keys(nfviColumns)) {
                let avg = data[0][key];

                if (avg!=null) {
                
                    let statkey = props.regionType+"_vulnerabilities_"+key;
                    let comparison = nfviColumns[key].deciles[decileToNumber(decile)];
                    
                    let significant = true;
                    if (comparison!=undefined) {                        
                        significant = false;
                        if (nfviColumns[key].direction=="less-than") {
                            comparison = nfviColumns[key].deciles[decileToNumber(flipDecile(decile))];
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
                        if (data[0][key]<decileToNumber(decile)) {                    
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
                                uk: nfviColumns[key].average, 
                                icon: lazy(() => import('../images/vulnerabilities/'+camelize(key))),
                            });
                        }
                    }
                }
            }
            setVulnerabilities(vulns);        
        }
    }, [decile,data]);
        
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
            <div className={'title'}>
              <h1>Social Vulnerabilities</h1>
              <div className="dropdown">
                <span className="caveat">Data quality</span>
	            <div className="dropdown-content">
                  This data is out of date and not reliable
                </div>
              </div>
            </div>
            <p>
              The following vulnerabilities are particularly important in your selected area of&nbsp;              

              <span className={"projected-regions"}>
                { andify(props.regions.map(e => e.name)) }
              </span>
              
              .&nbsp;These vulnerabilities are in the top&nbsp;
              
              <select value={decile} onChange={(e) => { setDecile(e.target.value); }}>
                <option value="dec_1">10%</option>
                <option value="dec_2">20%</option>
                <option value="dec_3">30%</option>
                <option value="dec_4">40%</option>
                <option value="dec_5">50%</option>
                {/* <option value="dec_6">60%</option>
                <option value="dec_7">70%</option>
                <option value="dec_8">80%</option>
              <option value="dec_9">90%</option> */}
              </select>

              &nbsp;in the UK:
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
                            {/*!v.name.startsWith("Index") &&
                             <div className={"vuln-type"}>{v.region.toFixed(2)}% vs {v.uk.toFixed(2)}% UK average</div>
                            */}
                          </div>
                      );
                  }) :
               <div>
                 {["boundary_uk_counties",
                   "boundary_la_districts"].includes(props.regionType) ?
                  (<h3>
                    Your selected area/s are not in the top {decileToText(decile)} for any vulnerabilities.
                     Note: Averaging across large areas tends to hide vulnerabilities that may be present.
                   </h3>) 
                 :
                  (<h3>
                     Your selected area/s are not in the top {decileToText(decile)} for any vulnerabilities.
                   </h3>)
                 }
               </div> 
              }
                 
            </div>  
	        <p className="note">
              Data source: The vulnerability data comes from <a href="https://www.climatejust.org.uk" target="_blank">ClimateJust</a> and is based on 2011 census data. This will be updated once the 2021 census data is available.
	        </p>
          </LoadingOverlay>
        </div>
    );
}

export default Vulnerabilities;
