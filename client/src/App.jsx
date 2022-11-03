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
import StatsLoader from './components/StatsLoader';
import Vulnerabilities from './components/Vulnerabilities';
import Adaptations from './components/Adaptations';

import { ReactComponent as LCATLogoSvg } from './images/logos/LCAT_Logo_Primary_RGB.svg';
import { ReactComponent as LogoBlockSvg } from './images/logos/logos.svg';
import { ReactComponent as EmailSvg } from './images/email_button.svg';

const meta = {
    title: 'Local Climate Adaptation Tool',
    description: 'This is a tool for local climate adaptation',
    canonical: 'http://beta-climate-tool.thentrythis.org',
    meta: {
        charset: 'utf-8',
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            regions: [],
            regionType: "counties",
            network: { nodes: [], edges: [] },
            climatePrediction: [],           
            average: "winter",
            rcp: "rcp60",
            year: 2070,
            loadingPrediction: false,          
            stats: [],
            networkParser: new NetworkParser([],[])
        };
    }

    render() {
        return (
            <div className="App">
              <DocumentMeta {...meta}/>
              <header className="App-header">
                <LCATLogoSvg width={300}/>
              </header>
              <p>
                The tool allows you to see local climate change predictions in the UK and explore the impact on our health and wellbeing. Local vulnerabilities are highlighted and adaptation priorities are suggested. The information presented is based on scientific research and links to the relevant data and publications are provided. The tool has been designed with, and for, local decision makers across the public, private and voluntary sectors.
                <p>
                  <a href="https://www.ecehh.org/wp/wp-content/uploads/2021/09/Frequently-Asked-Questions.pdf">See our Frequently Asked Questions for more information.</a>
                </p>
              </p>
              <NetworkLoader
                id={0}
                callback={(nodes, edges) => {
                    this.setState((state) => ({
                        network: { nodes: nodes, edges: edges },
                        networkParser: new NetworkParser(nodes,edges)
                    }));}}
              />

              <StatsLoader
                id={0}
                callback={(stats) => {
                    this.setState((state) => ({
                        stats: stats
                    }));}}
              />
              
              <ClimatePredictionLoader
                regions = {this.state.regions}
                average = {this.state.average}
                rcp = {this.state.rcp}
                regionType = {this.state.regionType}
                callback = {(prediction) => {
                    console.log("New climate prediction");
                    this.setState((state) => ({
                        climatePrediction: prediction,
                        loadingPrediction: false,                        
                    }));}}
                loadingCallback={ loading => { this.setState(() => ({
                    loadingPrediction: true
                }));}}
              />

              <ClimateMap
                stats = {this.state.stats}
                regionType = {this.state.regionType}
                regionsCallback={(regions,regionType) => {
                    this.setState({
                        regionType: regionType,
                        regions: regions,
                    });
                }}
              />

              <ClimateSettings
                regions={this.state.regions}
                rcpCallback={(rcp) => { this.setState(() => ({
                    rcp: rcp                  
                }));}}
                averageCallback={(average) => { this.setState(() => ({
                    average: average                  
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
              />
                                          
              <HealthWellbeing
                networkParser = {this.state.networkParser}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <Network
                network = {this.state.network}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                regions = {this.state.regions}
                networkParser = {this.state.networkParser}
              />

              <Vulnerabilities
                regions = {this.state.regions}
                regionType = {this.state.regionType}                
                stats = {this.state.stats}
              />

              <Adaptations
                networkParser = {this.state.networkParser}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                season = {this.state.average}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <div className="footer">

                <p>
                  The Local Climate Adaptation Tool has been developed by the <a href="">University of Exeter’s European Centre for Human Health</a>, <a href="">Cornwall Council</a>, <a href="">Then Try This</a> and <a href="">The Alan Turing Institute</a> with co-design partners from Local Government, the National Health Service, emergency services, and voluntary and private sectors. Funding for the project has been provided by Research England’s Collaboration Fund, Strategic Priorities Fund and Policy Support Fund, as part of the Policy@Exeter initiative, The Schroder Foundation, and the Net Zero Innovation Programme; a UCL and Local Government Association Initiative.
                </p>

                <p>
                  The LCAT project team (University of Exeter, Then Try This, Cornwall Council and The Alan Turing Institute) and their agents, take no responsibility for decisions taken as a result of the use of this tool. While every effort has been made to ensure data represented in the tool are accurate, no liability is accepted for any inaccuracies in the dataset or for any actions taken based on the use of this tool. The views expressed in this tool do not reflect the views of the organisations or the funding bodies. There is no guarantee that the tool will be updated to reflect changes in the source information.
                </p>
                
                <p>
                  <a href="">Source code published</a> under the <a href="">Common Good Public Licence Beta 1.0</a>
                </p>

                <p>
                  Copyright © 2022 Then Try This and University of Exeter
                </p>
                
                <p>
                  <a href="mailto:lcat@exeter.ac.uk">
                    <EmailSvg
                      className="email-button"
                      style={{
                          transform: "scale(2)"
                      }}
                    />
                  </a>
                </p>                

                <LogoBlockSvg style={{transform: "scale(2)"}}/>

              </div>
              
            </div> 
        );
    }
}

export default App;

