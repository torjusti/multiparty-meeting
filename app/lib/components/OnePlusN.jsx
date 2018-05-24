import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as appPropTypes from './appPropTypes';
import { Appear } from './transitions';
import Peer from './Peer';
import Me from './Me';
import Logger from '../Logger';

class OnePlusN extends React.Component
{
	constructor()
	{
		super();
		this.state = {
			ratio : 16 / 9
		};
		
	}
	
	render()
	{
		const {
			activeSpeakerName,
			peers,
			myName
		} = this.props;
		
		const style = 
			{
				'width'  : '100%',
				'height' : '100%'
			};

		const logger = new Logger();
		
		logger.warn('Misi render %s', activeSpeakerName);
		
		return (
			<div data-component='OnePlusN' ref='peers'>
				<div className={classnames('audience-container')}>
					{
						peers.map((peer) =>
						{
							if (peer.name !== activeSpeakerName)
							{
								return (
									<Appear key={peer.name} duration={1000}>
										<div
											className={classnames(
												'stamp-peer-container'
											)}
										>
											<Peer name={peer.name} />
										</div>
									</Appear>
								);
							} 
						})
					}
				</div>
				<div className={classnames('active-speaker-container')} style={style} >
					{

						peers.map((peer) =>
						{
							if (activeSpeakerName === peer.name)
							{
								return (
									<Peer name={peer.name} />
								);
							}
						})
						
					}						
					{	activeSpeakerName === myName || activeSpeakerName === null ? <Me/>:null
					}

				</div>
				
			</div>
		);
	}
}

OnePlusN.propTypes =
{
	peers             : PropTypes.arrayOf(appPropTypes.Peer).isRequired,
	activeSpeakerName : PropTypes.string,
	myName            : PropTypes.string
};

const mapStateToProps = (state) =>
{
	// TODO: This is not OK since it's creating a new array every time,
	//  so triggering a component rendering.
	const peersArray = Object.values(state.peers);	
	
	return {
		peers             : peersArray,
		activeSpeakerName : state.room.activeSpeakerName,		
		myName            : state.me.name
	};
};

const PeersContainer = connect(
	mapStateToProps	
)(OnePlusN);

export default PeersContainer;
