// -*- mode: rjsx;  -*-
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

import ClimateMap from "./components/ClimateMap.js";
import ClimateSummary from "./components/ClimateSummary.js";
import Graph from "./components/Graph.js";
import HealthWellbeing from './components/HealthWellbeing';
import Network from "./components/Network.js";
import NetworkLoader from './components/NetworkLoader';
import ClimatePredictionLoader from './components/ClimatePredictionLoader';

import { NetworkRenderer } from './core/NetworkRenderer';

const meta = {
    title: 'Local Climate Tool',
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
            loadingPrediction: false
        };
    }

    componentDidMount() {
        this.networkRenderer.loadIcons();
    }

    regionsCallback = (regions,regionType) => {
        this.setState({
            regionType: regionType,
            regions: regions
        });
    }

    networkCallback = (nodes, edges) => {
        this.setState((state) => ({
            network: { nodes: nodes, edges: edges },            
        }));        
    }

    climatePredictionCallback = (prediction) => {
        this.setState((state) => ({
            climatePrediction: prediction,
            loadingPrediction: false
        }));
    }
    
    render() {
        return (
            <div className="App">
              <DocumentMeta {...meta}/>
              <header className="App-header">
                <h1>Local Climate Tool V2.0</h1>
              </header>
                <p>
                You are looking at the national level testing version. <a href="http://climate-tool.thentrythis.org">The working Cornwall prototype is here.</a>
                </p>

              <NetworkLoader
                id={0}
                callback={this.networkCallback}
              />

              <ClimatePredictionLoader
                regions = {this.state.regions}
                average = {this.state.average}
                regionType = {this.state.regionType}
                callback = {this.climatePredictionCallback}
                loadingCallback={ loading => { this.setState(() => ({ loadingPrediction: true })); }}
              />

              <ClimateMap
                regionsCallback={this.regionsCallback}
              />

              <hr/>

              <p>
                Calculate using 
                <select onChange={(e) => { this.setState(() => ({
                    average: e.target.value                  
                }));}}>
                  <option value="ann">Yearly</option>
                  <option value="djf">Winter</option>
                  <option value="jja">Summer</option>
                </select>
                
                average predictions for year 
                
                <select onChange={(e) => { this.setState(() => ({
                    year: e.target.value                  
                }));}}>
                  <option value="1996">1996</option>
                  <option value="2006">2006</option>
                  <option value="2016">2016</option>
                  <option value="2026">2026</option>
                  <option value="2036">2036</option>
                  <option value="2046">2046</option>
                  <option value="2056">2056</option>
                  <option value="2066">2066</option>
                  <option value="2076">2076</option>
                  <option selected value="2086">2086</option>
                </select>
              </p>

              <hr/>

              <ClimateSummary
                climatePrediction = {this.state.climatePrediction}
                network = {this.state.network}
                year = {this.state.year}
                average = {this.state.average}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <hr/>
              
              <Graph
                regions={this.state.regions}
                regionType={this.state.regionType}                
              />

              <hr/>

              <HealthWellbeing
                network = {this.state.network}
                year = {this.state.year}
                climatePrediction = {this.state.climatePrediction}
                regions = {this.state.regions}
                loading = {this.state.loadingPrediction}
              />

              <hr/>

              <Network
                regions = {this.state.regions}
                regionType = {this.state.regionType}                
                network = {this.state.network}
                year = {this.state.year}
                average = {this.state.average}
                climatePrediction = {this.state.climatePrediction}
                networkRenderer = {this.networkRenderer}
              />
            </div> 
        );
    }
}

export default App;

