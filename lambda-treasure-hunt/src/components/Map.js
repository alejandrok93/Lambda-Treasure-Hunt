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
		this.setState({ map: this.load_map() });
	}

	save_map = map => {
		if (localStorage.getItem('map')) {
			//already exists
		}
	};

	load_map = () => {
		let map = localStorage.getItem('map');
		return JSON.parse(map);
	};

	inverse_directions = direction => {
		if (direction === 'n') {
			return 's';
		} else if (direction === 's') {
			return 'n';
		} else if (direction === 'w') {
			return 'e';
		} else if (direction === 'e') {
			return 'w';
		}
	};
	travel = dir => {
		console.log('lets traveeeel' + dir);
		const data = { direction: dir };
		console.log(data);
		const moveURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/move/';
		const options = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Token ' + '30e68dddf4426b85e7c98644cf2feb9c5a3d302a'
			}
		};

		axios
			.post(moveURL, data, options)
			.then(response => {
				console.log(response.data);
				this.setState({ currentRoom: response.data.currentRoom });
			})
			.catch(err => console.log(err));
	};
	traverse = () => {
		console.log('begin traversing!');
		// get map from state
		// while map.length < 500
		// travel in an unexplored direction from current room
		// save what room that direction leads to in map, and vice versa (fill out graph)
		// if reached a dead end, use BFS to go back
		//save map to state and local storage

		const map = this.state.map;
		console.log(map);
		let i = 0;
		while (i < 500) {
			console.log('hi');
			console.log('Current room: ' + this.state.currentRoom.room_id);
			//let currentRoomExits = this.state.map[this.state.currentRoom.room_id];
			let currentRoomExits = this.state.currentRoom.exits;
			let unexplored = [];
			for (let direction of currentRoomExits) {
				unexplored.push(direction);
			}

			if (unexplored.length > 0) {
				let direction = unexplored.pop();
				console.log(direction);
				let prevRoomId = this.state.currentRoom.room_id;
				map[prevRoomId] = {};
				console.log(map);
				setInterval(() => {
					this.travel(direction);
					let exitsObj = {};
					this.state.currentRoom.exits.forEach(exit => {
						exitsObj[exit] = '?';
					});
					map[prevRoomId][direction] = this.state.currentRoom.room_id;
					exitsObj[this.inverse_directions(direction)] = prevRoomId;
					map[this.state.currentRoom.room_id] = exitsObj;
				}, this.state.currentRoom.cooldown * 1000);
				console.log(map);
			} else {
				//reached a dead end
			}
			i++;
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
				} else {
					//map = localStorage.getItem('map')
					//what to do if map already exists?
				}
				this.setState({ currentRoom: response.data });
			})
			.catch(err => console.log(err));
	};

	render() {
		console.log(this.state);
		return (
			<div className="map">
				<button onClick={e => this.travel('n')}>Travel North </button>
				<button onClick={e => this.travel('s')}>Travel South </button>
				<button onClick={e => this.travel('w')}>Travel West </button>
				<button onClick={e => this.travel('e')}>Travel East </button>
				<br />
				<button onClick={e => this.traverse()}>Let's traverse! </button>
			</div>
		);
	}
}

export default Map;
