import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FullPeerView from './FullPeerView';

class ActiveSpeaker extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		const {
			peers,
			activeSpeakerName,
			lastActiveSpeakerName,
			videoSpotlightName,
			consumers
		} = this.props;

		let speakerName = activeSpeakerName ? activeSpeakerName : lastActiveSpeakerName;

		if (videoSpotlightName && (videoSpotlightName in peers))
			speakerName = videoSpotlightName;

		if (speakerName)
		{
			if (!(speakerName in peers))
			{
				return (
					<div data-component='ActiveSpeaker'>
						<div className='no-speaker' />
					</div>
				);
			}
			else
			{
				const consumersArray = peers[speakerName].consumers
					.map((consumerId) => consumers[consumerId]);
				const micConsumer =
					consumersArray.find((consumer) => consumer.source === 'mic');
				const webcamConsumer =
					consumersArray.find((consumer) => consumer.source === 'webcam');
				const screenConsumer =
					consumersArray.find((consumer) => consumer.source === 'screen');

				const videoVisible = (
					Boolean(webcamConsumer) &&
					!webcamConsumer.locallyPaused &&
					!webcamConsumer.remotelyPaused
				);

				const screenVisible = (
					Boolean(screenConsumer) &&
					!screenConsumer.locallyPaused &&
					!screenConsumer.remotelyPaused
				);

				let videoProfile;
	
				if (webcamConsumer)
					videoProfile = webcamConsumer.profile;

				let screenProfile;

				if (screenConsumer)
					screenProfile = screenConsumer.profile;

				return (
					<div data-component='ActiveSpeaker'>
						<FullPeerView
							peer={peers[speakerName]}
							audioTrack={micConsumer ? micConsumer.track : null}
							videoTrack={webcamConsumer ? webcamConsumer.track : null}
							screenTrack={screenConsumer ? screenConsumer.track : null}
							videoVisible={videoVisible}
							videoProfile={videoProfile}
							screenVisible={screenVisible}
							screenProfile={screenProfile}
						/>
					</div>
				);
			}
		}
		else
		{
			return (
				<div data-component='ActiveSpeaker'>
					<div className='no-speaker-crap' />
				</div>
			);
		}
	}
}

ActiveSpeaker.propTypes =
{
	peers                 : PropTypes.object,
	activeSpeakerName     : PropTypes.string,
	lastActiveSpeakerName : PropTypes.string,
	videoSpotlightName    : PropTypes.string,
	consumers             : PropTypes.object
};

const mapStateToProps = (state) =>
{
	return {
		peers                 : state.peers,
		activeSpeakerName     : state.room.activeSpeakerName,
		lastActiveSpeakerName : state.room.lastActiveSpeakerName,
		videoSpotlightName    : state.room.videoSpotlightName,
		consumers             : state.consumers
	};
};

const ActiveSpeakerContainer = connect(mapStateToProps)(ActiveSpeaker);

export default ActiveSpeakerContainer;
