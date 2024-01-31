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
import NetworkLoader from './components/NetworkLoader';
import { NetworkParser } from './core/NetworkParser';
import Vulnerabilities from './components/Vulnerabilities';
import Adaptations from './components/Adaptations';

import { ReactComponent as LCATLogoSvg } from './images/logos/LCAT_Logo_Primary_RGB.svg';
import ContactUs from './components/ContactUs';
import FAQFooter from './components/FAQFooter';
import Feedback from './components/Feedback';

const meta = {
    title: 'Local Climate Adaptation Tool',
    description: 'This is a tool for local climate adaptation',
    canonical: 'http://beta-climate-tool.thentrythis.org',
    meta: {
        charset: 'utf-8',
    }
};

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            regions: [],
            regionType: "counties",
            network: { nodes: [], edges: [] },
            climatePrediction: [],           
            season: "annual",
            rcp: "rcp60",
            year: 2070,
            loadingPrediction: false,          
            networkParser: new NetworkParser([],[])
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

                <p>
                  Use this tool to see what the scientific research is saying about:
                </p>
                <ul>
                  <li>How your local climate will change</li>
                  <li>The impacts on public health, and which groups are most vulnerable locally</li>
                  <li>Adaptations most appropriate to your local area</li>
                </ul>                  
                <p>
                  LCAT is evidence based and designed with and for local decision makers.
                  The tool is a prototype and under continued development, and currently only considers some heat impacts.
                </p>
                
                <p>
                  <a href="https://www.ecehh.org/wp/wp-content/uploads/2023/01/Frequently-Asked-Questions-1.pdf" target="_blank" rel="noreferrer">See our Frequently Asked Questions for more information.</a>
                </p>
              </div>
              
              <NetworkLoader
                id={0}
                callback={(nodes, edges) => {
                    this.setState((state) => ({
                        network: { nodes: nodes, edges: edges },
                        networkParser: new NetworkParser(nodes,edges)
                    }));}}
              />

              {/*<StatsLoader
                id={0}
                callback={(stats) => {
                    this.setState((state) => ({
                        stats: stats
                    }));}}
              />*/}
              
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
                  network = {this.state.network}
                  year = {this.state.year}
                  climatePrediction = {this.state.climatePrediction}
                  regions = {this.state.regions}
                  networkParser = {this.state.networkParser}
                  season={this.state.season}
                  rcp={this.state.rcp}
                />
              </div>}

              {this.state.regions.length>0 &&              
              <div className="grey-section">
                <Vulnerabilities
                  regions = {this.state.regions}
                  regionType = {this.state.regionType}                
                />
              </div>}
              
              {this.state.regions.length>0 &&              
               <div className="white-section">
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

              <div className="grey-section">
                <Feedback />
              </div> 

              <div className="contact-footer">
                <ContactUs />
                <FAQFooter />
              </div>

              <div className="footer">

                <p>
                  The Local Climate Adaptation Tool has been developed by
                  the <a href="https://www.ecehh.org/" target="_blank">University of Exeter’s European Centre for Human Health</a>, <a href="https://www.cornwall.gov.uk/" target="_blank">Cornwall Council</a>, <a href="https://thentrythis.org" target="_blank">Then Try This</a> and <a href="https://www.turing.ac.uk/" target="_blank">The Alan Turing Institute</a> with
                  co-design partners from Local Government, the National
                  Health Service, emergency services, and voluntary and private
                  sectors. Funding for the project has been provided by Research
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
                  This has been co-funded through the BlueAdapt project. BlueAdapt has received funding from the European Union’s Horizon Europe research and innovation programme under grant agreement No 101057764 and by the UKRI/HM Government.                  
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
                  <a href="https://github.com/UniExeterRSE/LCAT" target="_blank">Source code published</a> open source under the <a href="http://www.cgpl.org/" target="_blank">Common Good Public Licence Beta 1.0</a>
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

