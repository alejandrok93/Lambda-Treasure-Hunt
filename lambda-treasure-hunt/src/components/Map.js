import React, { Component } from 'react';
import Room from './Room';
import axios from 'axios';
import ReactCytoscape from 'react-cytoscape';
import Graph from 'react-graph-vis';

class Map extends Component {
	constructor() {
		super();
		this.state = {
			map: {},
			roomGraph: {
				0: { n: 1, s: 5, e: 3, w: 7 },
				1: { s: 0, n: 2, e: 12, w: 15 },
				2: { s: 1 },
				3: { w: 0, e: 4 },
				4: { w: 3 },
				5: { n: 0, s: 6 },
				6: { n: 5, w: 11 },
				7: { w: 8, e: 0 },
				8: { e: 0 },
				9: { n: 8, s: 10 },
				10: { n: 9, e: 11 },
				11: { w: 10, e: 6 },
				12: { w: 1, e: 13 },
				13: { w: 12, n: 14 },
				14: { s: 13 },
				15: { e: 1, w: 16 },
				16: { n: 17, e: 15 },
				17: { s: 16 }
			},
			currentRoom: 0,
			graph: {
				nodes: [{ id: 1, label: 'Node 1' }],
				edges: [{ from: 1, to: 2 }]
			},
			options: {
				layout: {},
				edges: {
					color: '#000000'
				}
			}
		};
	}
	componentDidMount() {
		this.init();
		let tmpGraph = {};
		let nodes = [];
		let edges = [];

		let roomGraph = this.state.roomGraph;
		console.log(roomGraph);
		for (let room_id in roomGraph) {
			nodes.push({ id: room_id, label: room_id });
			let connections = this.state.roomGraph[room_id];
			let roomConnectionsObj = roomGraph[room_id];

			for (let connection in roomConnectionsObj) {
				let roomConnectedTo = roomConnectionsObj[connection];

				if (connection === 'n') {
					//connections += 'north-connection';
					edges.push({ from: room_id, to: roomConnectedTo });
				} else if (connection === 's') {
					//connections += 'south-connection';
					edges.push({ from: room_id, to: roomConnectedTo });
				} else if (connection === 'w') {
					//connections += 'west-connection';
					edges.push({ from: room_id, to: roomConnectedTo });
				} else if (connection === 'e') {
					//connections += 'east-connection';
					edges.push({ from: room_id, to: roomConnectedTo });
				}

				console.log(
					`${room_id} is connected to ${roomConnectedTo} with ${connection.toUpperCase()} connection`
				);
			}
		}
		tmpGraph.nodes = nodes;
		tmpGraph.edges = edges;
		this.setState({ graph: tmpGraph }, console.log(this.state.graph));
	}

	save_map = (direction, previousRoom, currentRoom) => {
		let map = JSON.parse(localStorage.getItem('map'));
		console.log(map);
		if (map) {
			let exitsObj = {};
			currentRoom.exits.forEach(exit => {
				exitsObj[exit] = '?';
			});
			let prevRoom = previousRoom.room_id;
			console.log(map);
			console.log(`prev room: ${prevRoom}`);
			console.log(`direction: ${direction}`);
			console.log(`current room: ${currentRoom.room_id}`);

			//save in map graph
			if (previousRoom.errors.length === 0) {
				map[prevRoom][direction] = currentRoom.room_id;
				exitsObj[this.inverse_directions(direction)] = prevRoom;
			} else {
				console.log(previousRoom.errors);
				console.log(`${prevRoom} is a dead end. Need to go back`);
			}

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
		const apiKey = process.env.REACT_APP_API_KEY;
		const prevRoom = this.state.currentRoom;
		const moveURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/move/';
		const options = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Token ' + apiKey
			}
		};

		axios
			.post(moveURL, data, options)
			.then(response => {
				let currentRoom = response.data;
				console.log(response.data);
				console.log(`prev room: ${prevRoom.room_id}`);
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
		setTimeout(() => {
			this.moveAround();
			console.log('cooldown: ' + this.state.currentRoom.cooldown);
		}, 5000);
	};

	moveAround = () => {
		let currentRoom = this.state.currentRoom;
		let currentRoomExits = this.state.map[currentRoom.room_id];
		let unexplored = [];
		console.log(currentRoomExits);

		for (let direction in currentRoomExits) {
			console.log(direction);
			if (currentRoomExits[direction] === '?') {
				unexplored.push(direction);
			}
		}
		console.log(unexplored);
		if (unexplored.length > 0) {
			// go to room
			let direction = unexplored.pop();
			this.travel(direction);
		} else {
			//reached a dead end
			//back track to prev room with unexplored exits
			console.log('no unexplored exits available. need to go back');
		}
	};

	init = () => {
		const initURL = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';
		const apiKey = 'Token ' + process.env.REACT_APP_API_KEY;
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
			<div className="map-container">
				<div className="nav-controls">
					<button onClick={e => this.travel('n')}>Travel North </button>
					<br />
					<button onClick={e => this.travel('s')}>Travel South </button>
					<br />
					<br />
					<button onClick={e => this.travel('w')}>Travel West </button>
					<button onClick={e => this.travel('e')}>Travel East </button>
					<br />
					<br />
					<button onClick={e => this.traverse()}>Let's traverse! </button>
				</div>

				<div id="map" className="map">
					<Graph
						graph={this.state.graph}
						options={this.state.options}
						events={this.state.events}
					/>
				</div>
				{/* {Object.keys(this.state.map).map(room => (
					<Room id={room} />
				))} */}

				{/* <div className="map">
					{this.state.rows.map(row => {
						return (
							<div className="row">
								{this.state.rooms.map(room => (
									<Room
										connection="north-connection south-connection"
										id={room}
									/>
								))}
							</div>
						);
					})}
				</div> */}
			</div>
		);
	}
}

export default Map;
