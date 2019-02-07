import React, { Component } from 'react';

class Room extends Component {
	constructor() {
		super();
	}

	render() {
		return (
			<span
				className={`room ${this.props.id === 3 ? this.props.connection : ''}`}
			>
				{this.props.id}
			</span>
		);
	}
}

export default Room;
