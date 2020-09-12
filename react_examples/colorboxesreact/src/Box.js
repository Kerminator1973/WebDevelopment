import React, { Component } from 'react';
import './App.css';

class Box extends Component {
	render() {
  		var divStyle = {
				backgroundColor: this.props.bkcolor,
		};
        return <div className="Box" style={divStyle}>{this.props.btext}</div>
	}

}

export default Box;
