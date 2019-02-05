import React, { Component } from 'react';
import axios from 'axios';

class Map extends Component {
	constructor() {
		super();
		this.state = { map: {} };
	}
	componentDidMount() {
		//Need to replace API key with env variables!!!
		//const apiKey = process.env.API_KEY;
		//this.init();
	}
	init = () => {
		const direction = direction => {
			return { direction: 'direction' };
		};
		const moveURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';
		const options = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Token ' + '30e68dddf4426b85e7c98644cf2feb9c5a3d302a'
			}
		};

		axios
			.post(moveURL, direction('n'), options)
			.then(response => {
				console.log(response.data);
			})
			.catch(err => console.log(err));
	};

	render() {
		return <div className="map" />;
	}
}

export default Map;
