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

	save_map = (direction, prevRoom, currentRoom) => {
		let map = JSON.parse(localStorage.getItem('map'));
		console.log(map);
		if (map) {
			let exitsObj = {};
			currentRoom.exits.forEach(exit => {
				exitsObj[exit] = '?';
			});
			console.log(map);
			console.log(`prev room: ${prevRoom}`);
			console.log(`direction: ${direction}`);
			console.log(`current room: ${currentRoom.room_id}`);

			//save in map graph
			map[prevRoom][direction] = currentRoom.room_id;
			exitsObj[this.inverse_directions(direction)] = prevRoom;

			if (!map[currentRoom.room_id]) {
				map[currentRoom.room_id] = exitsObj;
			} else {
				map[currentRoom.room_id][this.inverse_directions(direction)] = prevRoom;
			}
			console.log(map);
		}

		//save map to state and local storage
		this.setState({ map: map });
		localStorage.setItem('map', JSON.stringify(map));
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
		console.log('lets travel ' + dir.toUpperCase());
		const data = { direction: dir };
		const prevRoom = this.state.currentRoom.room_id;
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
				let currentRoom = response.data;
				console.log(response.data);
				console.log(`prev room: ${prevRoom}`);
				console.log(`direction: ${dir}`);
				console.log(`current room ${response.data.room_id}`);
				this.setState(
					{ ...this.state, currentRoom: response.data },
					this.save_map(dir, prevRoom, currentRoom)
				);
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
		let i = 0;

		while (i < 5) {
			console.log('Current room: ' + this.state.currentRoom.room_id);
			//let currentRoomExits = this.state.map[this.state.currentRoom.room_id];

			let currentRoomExits = this.state.currentRoom.exits;
			let unexplored = [];
			for (let direction of currentRoomExits) {
				unexplored.push(direction);
			}
			console.log(unexplored);

			if (unexplored.length > 0) {
				let direction = unexplored.pop();
				let prevRoomId = this.state.currentRoom.room_id;
				map[prevRoomId] = {};
				setInterval(() => {
					console.log('inside interval, gonna travel to' + direction);
					this.travel(direction);

					// let exitsObj = {};
					// this.state.currentRoom.exits.forEach(exit => {
					// 	exitsObj[exit] = '?';
					// });
					// map[prevRoomId][direction] = this.state.currentRoom.room_id;
					// exitsObj[this.inverse_directions(direction)] = prevRoomId;
					// map[this.state.currentRoom.room_id] = exitsObj;
				}, this.state.currentRoom.cooldown * 1000);
				console.log(map);
			} else {
				//reached a dead end
			}
			i++;
		}
	};

	init = () => {
		const initURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';
		const apiKey = 'Token ' + '30e68dddf4426b85e7c98644cf2feb9c5a3d302a';
		const options = {
			headers: {
				Authorization: apiKey
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
					this.setState({ map: map, currentRoom: response.data });
				} else {
					let map = JSON.parse(localStorage.getItem('map'));
					//what to do if map already exists?
					// set state with existing map
					this.setState({ map: map, currentRoom: response.data });
				}
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
