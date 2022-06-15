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
import Graph from "./components/Graph.js";
import Network from "./components/Network.js";

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

        this.state = {
            regions: [],
            regionType: "counties"
        };
    }

    regionsCallback = (regions,regionType) => {
        this.setState({
            regionType: regionType,
            regions: regions
        });
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

              <ClimateMap
                regionsCallback={this.regionsCallback}
              />
              { this.state.regions.length > 0 &&
                <div>
                  <Graph
                    regions={this.state.regions}
                    region={this.state.regionType}                
                  />
                  <Network/>
                </div> }
            </div>
            
        );
    }
}

export default App;
