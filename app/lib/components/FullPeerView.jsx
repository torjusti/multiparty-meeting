import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Spinner from 'react-spinner';
import * as appPropTypes from './appPropTypes';
import Draggable from 'react-draggable';

export default class FullPeerView extends React.Component
{
	constructor(props)
	{
		super(props);

		// Latest received video track.
		// @type {MediaStreamTrack}
		this._videoTrack = null;

		// Latest received screen track.
		// @type {MediaStreamTrack}
		this._screenTrack = null;
	}

	render()
	{
		const {
			videoVisible,
			videoProfile,
			screenVisible,
			screenProfile
		} = this.props;

		return (
			<div data-component='FullPeerView'>
				<video
					ref='speaker'
					className={classnames({
						screensharing : screenVisible,
						hidden        : !videoVisible && !screenVisible,
						loading       : videoProfile === 'none' && screenProfile === 'none'
					})}
					autoPlay
					muted={Boolean(true)}
				/>

				<Draggable handle='.speaker-handle' bounds='body'>
					<div className={classnames('speaker-cam', { hidden: !screenVisible, loading: videoProfile === 'none' })}>
						<div className='speaker-handle'>
							<span>Speaker (sharing screen)</span>
						</div>
						<video
							ref='speakermini'
							autoPlay
							muted={Boolean(true)}
						/>
					</div>
				</Draggable>

				{videoProfile === 'none' && screenProfile === 'none' ?
					<div className='spinner-container'>
						<Spinner />
					</div>
					:null
				}
			</div>
		);
	}

	componentDidMount()
	{
		const { videoTrack, screenTrack } = this.props;

		this._setTracks(videoTrack, screenTrack);
	}

	componentWillReceiveProps(nextProps)
	{
		const { videoTrack, screenTrack } = nextProps;

		this._setTracks(videoTrack, screenTrack);
	}

	_setTracks(videoTrack, screenTrack)
	{
		if (this._videoTrack === videoTrack &&
			this._screenTrack === screenTrack)
			return;

		this._videoTrack = videoTrack;
		this._screenTrack = screenTrack;

		const { speaker, speakermini } = this.refs;

		if (videoTrack || screenTrack)
		{
			const stream = new MediaStream;

			if (videoTrack)
				stream.addTrack(videoTrack);

			if (screenTrack)
			{
				const screenStream = new MediaStream;

				screenStream.addTrack(screenTrack);

				speaker.srcObject = screenStream;
				speakermini.srcObject = stream;
			}
			else
			{
				speaker.srcObject = stream;
			}
		}
		else
		{
			speaker.srcObject = null;
			speakermini.srcObject = null;
		}
	}
}

FullPeerView.propTypes =
{
	peer : PropTypes.oneOfType(
		[ appPropTypes.Me, appPropTypes.Peer ]).isRequired,
	audioTrack    : PropTypes.any,
	videoTrack    : PropTypes.any,
	screenTrack   : PropTypes.any,
	videoVisible  : PropTypes.bool.isRequired,
	videoProfile  : PropTypes.string,
	screenVisible : PropTypes.bool,
	screenProfile : PropTypes.string
};
