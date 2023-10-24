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

import React from 'react';
import DocumentMeta from 'react-document-meta';

import './App.css';

import ClimateMap from "./components/ClimateMap";
import ClimateSettings from './components/ClimateSettings';
import ClimateSummary from "./components/ClimateSummary";
import ClimatePredictionLoader from './components/ClimatePredictionLoader';
import Graph from "./components/Graph";
import HealthWellbeing from './components/HealthWellbeing';
import Network from "./components/Network";
import NetworkNamesLoader from './components/NetworkNamesLoader';
import NetworkLoader from './components/NetworkLoader';
import { NetworkParser } from './core/NetworkParser';
import Vulnerabilities from './components/Vulnerabilities';
import Adaptations from './components/Adaptations';
import { loadIcons } from './utils/iconLoader';
import Hazards from "./components/Hazards";

import { ReactComponent as LCATLogoSvg } from './images/logos/LCAT_Logo_Primary_RGB.svg';

const meta = {
    title: 'Local Climate Adaptation Tool',
    description: 'This is a tool for local climate adaptation',
    canonical: 'http://beta-climate-tool.thentrythis.org',
    meta: {
        charset: 'utf-8',
    }
};

const network_layers = [
    [""],
    ["Coastal security Summary","Coastal security In Full"],
    ["Extreme storms Summary","Extreme storms In Full"],
    ["Drought summary","Flooding summary","Flooding and drought in full"],
	["Food and personal security summary","Food and personal security in full"],
    ["Temperature Summary","Temperature In Full",],
];

class App extends React.Component {
    constructor(props) {
        super(props);

        // preload some icons
        loadIcons();
        
        this.state = {
            regions: [],
            regionType: "counties",
            networks: ["Heat version 2"],
            networkID: 3,
            climatePrediction: [],           
            season: "annual",
            rcp: "rcp60",
            year: 2070,
            loadingPrediction: false,          
            networkParser: new NetworkParser([],[]),
            layerName: "All"
        };
    }

    render() {
        return (
            <div className="App">
              <DocumentMeta {...meta}/>

              <div className="white-section">                
                <header className="App-header">
                  <LCATLogoSvg width={300}/>
                </header>
              </div>
              
              
		      <div className="grey-section">

                <p>Use this tool to see how your local climate will change, the impacts on public health, social and environmental vulnerabilities, and the most appropriate adaptations for your area.</p>
                
                <p>The tool is a prototype, and only considers some heat impacts. The version you are looking at was developed by Then Try This. The tool continues to be developed by the University of Exeter, so you may find a more recent version at <a href="https://lcat.uk/">https://lcat.uk/</a></p>
                
                <p>
                  <a href="https://web.archive.org/web/20231017162308/https://www.ecehh.org/wp/wp-content/uploads/2023/01/Frequently-Asked-Questions-1.pdf"  target="_blank">See our Frequently Asked Questions for more information.</a>
                </p>
		      </div>
              
              
              {/*<NetworkNamesLoader                
                callback={(names) => {
                    this.setState((state) => ({
                        networks: names
                    }));
                }}
                />*/}
                           
              <NetworkLoader
                id={this.state.networkID}
                layerName={this.state.layerName}
                callback={(nodes, edges) => {
                    this.setState((state) => ({
                        networkParser: new NetworkParser(nodes,edges)
                    }));}}
              />

              <ClimatePredictionLoader
                regions = {this.state.regions}
                season = {this.state.season}
                rcp = {this.state.rcp}
                regionType = {this.state.regionType}
                callback = {(prediction) => {
                      this.setState((state) => ({
                          climatePrediction: prediction,
                        loadingPrediction: false,                        
                    }));}}
                loadingCallback={ loading => { this.setState(() => ({
                    loadingPrediction: true
                }));}}
              />
              
              <div className="white-section">
                <ClimateMap
                  regionType = {this.state.regionType}
                  regionsCallback={(regions,regionType) => {
                      this.setState({
                          regionType: regionType,
                          regions: regions,
                      });
                  }}
                />
              </div>

              {this.state.regions.length>0 &&              
              <div className="grey-section">
                <ClimateSettings
                  regions={this.state.regions}
                  season={this.state.season}
                  rcp={this.state.rcp}
                  rcpCallback={(rcp) => { this.setState(() => ({
                      rcp: rcp                  
                  }));}}
                  seasonCallback={(season) => {
                      this.setState(() => ({
                          season: season                  
                      }));}}
                  yearCallback={(year) => { this.setState(() => ({
                      year: year                  
                  }));}}
                />
                
                <ClimateSummary
                  climatePrediction = {this.state.climatePrediction}
                  year = {this.state.year}
                  regions = {this.state.regions}
                  loading = {this.state.loadingPrediction}
                />
                
                <Graph
                  regions={this.state.regions}
                  boundary={this.state.regionType}
                  season={this.state.season}
                  rcp={this.state.rcp}
                  seasonCallback={(season) => {
                      this.setState(() => ({
                          season: season                  
                      }));}}
                  rcpCallback={(rcp) => { this.setState(() => ({
                      rcp: rcp                  
                  }));}}
                />
              </div>}

              {this.state.regions.length>0 &&              
               <div className="white-section">
                <Hazards
                  regions = {this.state.regions}
                  regionType = {this.state.regionType}                
                />
               </div>}
              
              {this.state.regions.length>0 &&              
               <div className="grey-section">

                 
                 {/*
		         <p>
                   Choose network:&nbsp;
                   <select onChange={(e) => {
                       this.setState({
                           networkID: e.target.value,
                           //layerName: network_layers[e.target.value][0],
                       });}}>
                     {this.state.networks.map((network) => {
                         return <option value={network.network_id}>{network.name}</option>;
                     })}
                   </select>
                   &nbsp;& layer:&nbsp;
                   <select onChange={(e) => this.setState({layerName: e.target.value})}>
                     {network_layers[this.state.networkID].map((layer) => {
                         return <option value={layer}>{layer}</option>;
                     })}
                   </select>
                 </p>
                  */}
                 
                 
                 <HealthWellbeing
                   networkParser = {this.state.networkParser}
                   year = {this.state.year}
                   climatePrediction = {this.state.climatePrediction}
                   regions = {this.state.regions}
                   loading = {this.state.loadingPrediction}
                   season={this.state.season}
                   rcp={this.state.rcp}
                 />

                 <Network
                   networks = {this.state.networks}
                   year = {this.state.year}
                   climatePrediction = {this.state.climatePrediction}
                   regions = {this.state.regions}
                   networkParser = {this.state.networkParser}
                   season={this.state.season}
                   rcp={this.state.rcp}
                 />
               </div>}
              
              {this.state.regions.length>0 &&              
              <div className="white-section">
                <Vulnerabilities
                  regions = {this.state.regions}
                  regionType = {this.state.regionType}                
                />
              </div>}
              
              {this.state.regions.length>0 &&              
               <div className="grey-section">
                 <Adaptations
                   networkParser = {this.state.networkParser}
                   year = {this.state.year}
                  climatePrediction = {this.state.climatePrediction}
                  season = {this.state.season}
                  rcp={this.state.rcp}
                  regions = {this.state.regions}
                  loading = {this.state.loadingPrediction}
                />
               </div>}
              
              <div className="footer white-section">

                <p>
                  The Local Climate Adaptation Tool has been developed by
                  the <a href="https://www.ecehh.org/" target="_blank">University of Exeter’s European Centre for Human Health</a>, <a href="https://www.cornwall.gov.uk/" target="_blank">Cornwall Council</a>, <a href="https://thentrythis.org" target="_blank">Then Try This</a> and <a href="https://www.turing.ac.uk/" target="_blank">The Alan Turing Institute</a> with
                  co-design partners from Local Government, the National
                  Health Service, emergency services, and voluntary and private
                  sectors. This project has been co-funded through the BlueAdapt project.
                  BlueAdapt has received funding from the European Union’s
                  Horizon Europe research and innovation programme under grant
                  agreement No 101057764 and by the UKRI/HM Government.

                  Other funding includes Research
                  England’s Collaboration Fund, Strategic Priorities Fund and
                  Policy Support Fund, as part of the Policy@Exeter initiative,
                  The Schroder Foundation, and the Net Zero Innovation
                  Programme; a UCL and Local Government Association Initiative.
                  This work was also supported by Wave 1 of The UKRI Strategic
                  Priorities Fund under the EPSRC Grant EP/W006022/1, delivered
                  through the “Environment and Sustainability” theme within The
                  Alan Turing Institute.
                </p>

                <p>
                  The LCAT project team (University of Exeter, Then Try This,
                  Cornwall Council and The Alan Turing Institute) and their
                  agents, take no responsibility for decisions taken as a
                  result of the use of this tool. While every effort has been
                  made to ensure data represented in the tool are accurate, no
                  liability is accepted for any inaccuracies in the dataset or
                  for any actions taken based on the use of this tool. The
                  views expressed in this tool do not reflect the views of the
                  organisations or the funding bodies. There is no guarantee
                  that the tool will be updated to reflect changes in the
                  source information.
                </p>
                
                <p>
                  <a href="https://gitlab.com/then-try-this/climate-tool" target="_blank">Source code published</a> open source under the <a href="http://www.cgpl.org/" target="_blank">Common Good Public Licence Beta 1.0</a>
                </p>

                <p>
                  Copyright © 2022 Then Try This and University of Exeter
                </p>
                
                <div className="logo-block">
                  <img className="logos"/>
                </div>

                <div className="logo-block">
                  <img className="funder-logos"/>
                </div>

              </div>
              
            </div> 
        );
    }
}

export default App;

