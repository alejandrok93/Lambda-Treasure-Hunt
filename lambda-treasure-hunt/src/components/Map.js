import React, { Component } from 'react';
import Room from './Room';
import axios from 'axios';
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

				console
					.log
					//`${room_id} is connected to ${roomConnectedTo} with ${connection.toUpperCase()} connection`
					();
			}
		}
		tmpGraph.nodes = nodes;
		tmpGraph.edges = edges;
		this.setState({ graph: tmpGraph }, console.log(this.state.graph));
	}

	save_map = (direction, previousRoom, currentRoom) => {
		let map = JSON.parse(localStorage.getItem('map'));
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
		}

		//save map to state and local storage
		this.setState({ map: map });
		localStorage.setItem('map', JSON.stringify(map));
		console.log('saved map to state, should be available now!');
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

	backtrack = currentRoom => {
		let q = [];
		let visited = new Set();
		let map = JSON.parse(localStorage.getItem('map'));
		q.push([currentRoom]);
		while (q.length > 0) {
			let path = q.shift();
			console.log('path', path);

			let node = path[path.length - 1];
			console.log('node ', node);
			console.log(map);
			console.log('map[node]', map[node]);
			if (!visited.has(node)) {
				visited.add(node);
				for (let [exit, room] of Object.entries(map[node])) {
					console.log('exit', exit);
					if (map[node][exit] == '?') {
						return path;
					} else {
						let path_copy = path.slice();
						path_copy.push(map[node][exit]);
						q.push(path_copy);
					}
				}
			}
		}
		return null;
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

				if (prevRoom.room_id === currentRoom.room_id) {
					console.log('something went wrong with our travels');
				} else {
					this.setState(
						{ ...this.state, currentRoom: response.data },
						this.save_map(dir, prevRoom, currentRoom)
					);
				}
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
		console.log('Current room:', currentRoom.room_id);
		console.log('Current map:');
		let map = JSON.parse(localStorage.getItem('map'));
		console.log(map);
		let currentRoomExits = map[currentRoom.room_id];

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
			console.log(
				'no unexplored exits available in room ' +
					currentRoom.room_id +
					', need to go back'
			);

			if (!(currentRoom.room_id in map)) {
				console.log('map does not have current room in graph');
			}
			let path = this.backtrack(currentRoom.room_id);
			if (path === null) {
				// no more unexplored rooms
				console.log('done traversing!');
			} else {
				console.log('path', path);
				let directions_to_shortest = [];
				let currentRoom = path.shift();
				console.log(currentRoom);
				console.log('map[currentRoom]', map[currentRoom]);
				for (let room of path) {
					for (let direction in map[currentRoom]) {
						console.log(direction);
						if (map[currentRoom][direction] === room) {
							directions_to_shortest.push(direction);
							// currentRoom = room;
							// break;
						}
					}
				}
				for (let direction of directions_to_shortest) {
					setTimeout(
						this.travel(direction),
						this.state.currentRoom.cooldown * 1000
					);
				}
			}
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
				<div className="map-info">
					<div className="nav-controls">
						<h3>Directions: </h3>
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
					<div className="current-room-info">
						<h3>Current Room Info:</h3>
						<p>
							Current room:{' '}
							{`${this.state.currentRoom.title} (${
								this.state.currentRoom.room_id
							})`}
						</p>
						<p>Room Description: {this.state.currentRoom.description}</p>
						<p>
							Possible exits:
							{this.state.currentRoom
								? this.state.currentRoom.exits.map(
										exit => exit.toUpperCase() + ', '
								  )
								: ''}
						</p>
						<p>Cooldown: {this.state.currentRoom.cooldown}</p>
					</div>
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
