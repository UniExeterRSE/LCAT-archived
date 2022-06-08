import React, { Component, useEffect } from 'react';
import {XYPlot, XAxis, YAxis, VerticalBarSeries} from 'react-vis';

import '../../node_modules/react-vis/dist/style.css';
import ModelLoader from './ModelLoader';

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []            
        };
    }

    callback = (data) => {
        console.log("----------");
        console.log(data);
        this.setState(() => ({
                data: data.map(v => ({x: v.year, y: v.avg}))
        }));                     
    }
    
    render() {
        return (            
            <div>
              <h1>Graph</h1>
              <ModelLoader
                regions={this.props.regions}
                table={this.props.table}
                region={this.props.region}
                callback={this.callback}
              />
              <XYPlot height={300} width={600} xType="ordinal">
                <XAxis />
                <YAxis />
                <VerticalBarSeries data={this.state.data} />
              </XYPlot>
            </div>
        );
    }
}

export default Graph;
