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
import Sector from './components/Sector';
import StatsLoader from './components/StatsLoader';
import Vulnerabilities from './components/Vulnerabilities';
import Adaptations from './components/Adaptations';
import { ReactComponent as LCATLogoSvg } from './images/logos/LCAT_Logo_Primary_RGB.svg';

import { NetworkRenderer } from './core/NetworkRenderer';

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

        // should this be in the state?? seems wrong.
        this.networkRenderer = new NetworkRenderer();

        this.state = {
            regions: [],
            regionType: "counties",
            network: { nodes: [], edges: [] },
            climatePrediction: [],           
            average: "winter",
            rcp: "rcp60",
            year: 2070,
            loadingPrediction: false,
            sector: "all",
            stats: []
        };
    }

    componentDidMount() {
        this.networkRenderer.loadIcons();
    }

    render() {
        return (
            <div className="App">
              <DocumentMeta {...meta}/>
              <header className="App-header">
                <LCATLogoSvg
                  width={300}/>
              </header>
              <p>
                This tool allows you to see local climate change predictions in the UK, and explore the impacts on our health and wellbeing. Local vulnerabilities are highlighted, and adaptation priorities are suggested. The information presented is based on scientific research, and links to the relevant data and publications are provided.
              </p>
              <p>
                <ul>
                  <li>FAQ text and link to come</li>
                  <li>Disclaimer to come</li>
                </ul>
              </p>
              {/* bundle up all the api calls into one when decided? */}
              <NetworkLoader
                id={0}
                callback={(nodes, edges) => {
                    this.setState((state) => ({
                        network: { nodes: nodes, edges: edges },            
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
                    console.log("new climate prediction");
                    this.setState((state) => ({
                        climatePrediction: prediction,
                        loadingPrediction: false
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
                network = {this.state.network}
                year = {this.state.year}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />
              
              <Graph
                regions={this.state.regions}
                boundary={this.state.regionType}                
              />
              
              {/*<Sector
                regions = {this.state.regions}
                callback={(sector) => { this.setState(() => ({
                    sector: sector
                    }));}}/>*/}
                            

              
              <HealthWellbeing
                network = {this.state.network}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <Network
                regions = {this.state.regions}
                regionType = {this.state.regionType}                
                network = {this.state.network}
                year = {this.state.year}
                average = {this.state.average}
                climatePrediction = {this.state.climatePrediction}
                sector = {this.state.sector}
                networkRenderer = {this.networkRenderer}
              />

              <Vulnerabilities
                regions = {this.state.regions}
                regionType = {this.state.regionType}                
                stats = {this.state.stats}
              />

              <Adaptations
                network = {this.state.network}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                season = {this.state.average}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <div className="footer">
                <p>
                  The Local Climate Adaptation Tool has been developed by the University of Exeter’s European Centre for Human Health, Cornwall Council, Then Try This and The Alan Turing Institute with co-design partners from Local Government, the National Health Service, emergency services, and voluntary and private sectors. Funding for the project has been provided, Research England’s Collaboration Fund, Strategic Priorities Fund and Policy Support Fund, as part of the Policy@Exeter initiative, The Schroder Foundation, and the Net Zero Innovation Programme; a UCL and Local Government Association Initiative.
                </p>
                
                <p>
                  Source code published under the Common Good Public Licence Beta 1.0
                  Copyright © 2022 Then Try This and University of Exeter
                </p>

                <p>
                  LOGOS: exeter, ecehh, ttt, cc, turing
                </p>
              </div>
              
              
            </div> 
        );
    }
}

export default App;

