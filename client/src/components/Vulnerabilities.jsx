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

import React, { useEffect, useState } from 'react';

import { ReactComponent as HealthAndWellbeingSvg } from '../images/icons/Public health & wellbeing.svg';
import VulnerabilityIcon from '../icons/Vulnerabilities';
import { andify } from '../utils/utils';
import { sfriColumns } from '../core/climatejust';

import './Vulnerabilities.css';

function Vulnerabilities(props) {

    const [ vulnerabilities, setVulnerabilities ] = useState([]);
    const [ decile, setDecile ] = useState("dec_1");
    
    useEffect(() => {
        let vulns=[];
        if (props.regions.length>0) {            
            // do imd average
            let uk_avg = props.stats[props.regionType+"_imd_avg"];
            if (false && uk_avg!=undefined) {
                let avg = props.regions.reduce(
                    (acc,region) =>
                        acc+region.properties.imdscore
                    ,0);               
                avg/=props.regions.length;
                if (avg<uk_avg) {
                    vulns.push({
                        type: "Index of Multiple Deprivation",
                        name: "Lower than average",                        
                        region: avg,
                        uk: props.stats[props.regionType+"_imd_avg"]
                    });
                }
            }

            // do sfri averages
            for (let key of Object.keys(sfriColumns)) {
                let avg = props.regions.reduce(
                    (acc,region) =>
                        acc+region.properties[key]
                    ,0);
                avg/=props.regions.length;

                let comparison = props.stats[props.regionType+"_"+key+"_"+decile];                
                if (comparison!=undefined && avg>comparison) {
                    vulns.push({
                        type: "Neighbourhood Flood Vulnerability Index (NFVI) Supporting Variables",
                        name: sfriColumns[key].name,
                        region: avg,
                        uk: props.stats[props.regionType+"_"+key+"_avg"]
                    });
                }
            }            
        }
        setVulnerabilities(vulns);
    }, [props.regions,
        props.stats,
        props.regionType,
        decile]);

        
    if (props.regions.length === 0) {
        return null;
    }
    
    return (
        <div>
          <h1>Vulnerabilities</h1>
          <p>
            The following vulnerabilities are the most important to consider in 
            
            <span className={"projected-regions"}>
              { andify(props.regions.map(e => e.name)) }.
            </span>
            
            (these vulnerabilities are in the top

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

            compared with UK averages).
          </p>
          
          <div className={"vuln-container"}>        
            {vulnerabilities.map(
                v => 
                    <div className={"vuln"}>
                      <VulnerabilityIcon/>
                      <div className={"vuln-name"}>{v.name}</div>                      
                      <div className={"vuln-type"}>{v.type}</div>
                      <div className={"vuln-type"}>{v.region.toFixed(2)}% vs {v.uk.toFixed(2)}% UK average</div>
                    </div>)}
          </div>
	    <p>
		Source data on vulnerabilities from <a href="https://www.climatejust.org.uk">ClimateJust</a> based on work carried out by <a href="http://www.sayersandpartners.co.uk/uploads/6/2/0/9/6209349/sayers_2017_-_present_and_future_flood_vulnerability_risk_and_disadvantage_-_final_report_-_uploaded_05june2017_printed_-_high_quality.pdf">Sayers and Partners LLP for the Joseph Rowntree Foundation</a>.
	    </p>
        </div>
    );
}

export default Vulnerabilities;
