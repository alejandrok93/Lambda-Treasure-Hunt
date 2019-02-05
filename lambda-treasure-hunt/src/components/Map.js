import React, { Component } from 'react';
import axios from 'axios';

class Map extends Component {
	constructor() {
		super();
		this.state = { map: {}, currentRoom: 0 };
	}
	componentDidMount() {
		//Need to replace API key with env variables!!!
		//const apiKey = process.env.API_KEY;
		this.init();
	}

	save_map = map => {
		if (localStorage.getItem('map')) {
			//already exists
		}
	};

	init = () => {
		const direction = direction => {
			return { direction: 'direction' };
		};
		const initURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';
		const options = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Token ' + '30e68dddf4426b85e7c98644cf2feb9c5a3d302a'
			}
		};

		axios
			.get(initURL, options)
			.then(response => {
				console.log(response.data);
				if (!localStorage.getItem('map')) {
					let map = {};
					let exits = {};
					response.data.exits.forEach(exit => {
						exits[exit] = '?';
					});
					map[response.data.room_id] = exits;
					console.log(map);
					localStorage.setItem('map', JSON.stringify(map));
				}
			})
			.catch(err => console.log(err));
	};

	render() {
		return <div className="map" />;
	}
}

export default Map;
