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
            average: "ann",
            year: 2086,
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
                <h1>Local Climate Adaptation Tool V2.0</h1>
              </header>
                <p>
                  You are looking at the national level testing version - this is in development and the data is not reliable, so it should not be shared yet. We anticipate a new version ready for release in November 2022. <a href="http://climate-tool.thentrythis.org">The working Cornwall prototype is here.</a>
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
                regionType = {this.state.regionType}
                callback = {(prediction) => {
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
                average = {this.state.average}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />
              
              <Graph
                regions={this.state.regions}
                regionType={this.state.regionType}                
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
                sector = {this.state.sector}
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


              <div className={"footer"}/>
              
            </div> 
        );
    }
}

export default App;

