import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as appPropTypes from './appPropTypes';
import * as stateActions from '../redux/stateActions';
import { Appear } from './transitions';
import Peer from './Peer';

class FilmStrip extends React.Component
{
	constructor()
	{
		super();

		this.state = {
			ratio      : 4 / 3,
			peerWidth  : 320,
			peerHeight : 240
		};
	}

	updateDimensions()
	{
		const n = this.props.peers.length;

		if (n == 0) 
		{
			return;
		}

		const width = this.refs.filmstrip.clientWidth;

		let nWidth = width / n;
		let nHeight = nWidth / this.state.ratio;

		if (nWidth / this.state.ratio > this.refs.filmstrip.clientHeight)
		{
			nHeight = this.refs.filmstrip.clientHeight;
			nWidth = nHeight * this.state.ratio;
		}

		this.setState({
			peerWidth  : nWidth,
			peerHeight : nHeight
		});
	}
	
	componentDidMount()
	{
		window.addEventListener('resize', this.updateDimensions.bind(this));
	}
	
	componentWillUnmount() 
	{
		window.removeEventListener('resize', this.updateDimensions.bind(this));
	}

	componentWillReceiveProps()
	{
		this.updateDimensions();
	}

	render()
	{
		const {
			activeSpeakerName,
			videoSpotlightName,
			peers,
			onToggleVideoSpotlight
		} = this.props;

		const style = 
			{
				'width'  : this.state.peerWidth,
				'height' : this.state.peerHeight
			};

		return (
			<div
				data-component='FilmStrip'
				ref='filmstrip'
				data-tip='Click participant to<br>lock video spotlight'
				data-type='dark'
				data-for='globaltip'
			>
				{
					peers.map((peer) =>
					{
						return (
							<Appear key={peer.name} duration={1000}>
								<div
									className={classnames('peer-container', {
										'active-speaker'  : peer.name === activeSpeakerName,
										'video-spotlight' : peer.name === videoSpotlightName
									})}
									style={style}
									onClick={() => { onToggleVideoSpotlight(peer.name); }}
								>
									<Peer name={peer.name} />
								</div>
							</Appear>
						);
					})
				}
			</div>
		);
	}
}

FilmStrip.propTypes =
{
	peers                  : PropTypes.arrayOf(appPropTypes.Peer).isRequired,
	activeSpeakerName      : PropTypes.string,
	videoSpotlightName     : PropTypes.string,
	onToggleVideoSpotlight : PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch) =>
{
	return {
		onToggleVideoSpotlight : (peerName) =>
		{
			dispatch(stateActions.onToggleVideoSpotlight(peerName));
		}
	};
};

const mapStateToProps = (state) =>
{
	const peersArray = Object.values(state.peers);

	return {
		peers              : peersArray,
		activeSpeakerName  : state.room.activeSpeakerName,
		videoSpotlightName : state.room.videoSpotlightName
	};
};

const FilmStripContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(FilmStrip);

export default FilmStripContainer;
