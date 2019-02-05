import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Map from './components/Map';

class App extends Component {
	constructor() {
		super();
		this.state = { map: {} };
	}
	componentDidMount() {}
	render() {
		return (
			<div className="App">
				<h1>Lambda Treasure Hunt</h1>
				<Map />
			</div>
		);
	}
}

export default App;
