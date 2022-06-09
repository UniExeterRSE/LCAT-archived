import React from 'react';

import './App.css';

import ClimateMap from "./components/ClimateMap.js";
import Graph from "./components/Graph.js";

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
              <header className="App-header">
                <h2>Local Climate Tool V2.0</h2>
              </header>
              <ClimateMap
                regionsCallback={this.regionsCallback}
              />
              <Graph
                regions={this.state.regions}
                region={this.state.regionType}                
              />
            </div>
            
        );
    }
}

export default App;
