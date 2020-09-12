import React, { Component } from 'react';
import './App.css';

class App extends Component {

	constructor(props) {
    	super(props);

    	this.state = {
			data: [],
    		inputText: ''
		}
	}

	render() {
		return (
			<div className="App">
			<form onSubmit = {(e) => {
				e.preventDefault();
				const data = [...this.state.data,
					this.state.inputText];
				this.setState({data, inputText: ''});
			}}>

				<input type="text" 
					name="inputText"
					value={this.state.inputText}
					onChange={(e) => {
						this.setState({[e.target.name]: e.target.value})
					}}
				/>

				<button type="submit">Submit</button>

			</form>

			<ol>
			{this.state.data.map((value, index) => {
		      	return <li key={index}>{value}</li>
			})}
			</ol>
			</div>
		);
	}
}

export default App;
