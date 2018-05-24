import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Spinner from 'react-spinner';
import hark from 'hark';
import * as appPropTypes from './appPropTypes';
import EditableInput from './EditableInput';

export default class PeerView extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
		{
			volume       : 0, // Integer from 0 to 10.,
			videoWidth   : null,
			videoHeight  : null,
			screenWidth  : null,
			screenHeight : null
		};

		// Latest received video track.
		// @type {MediaStreamTrack}
		this._audioTrack = null;

		// Latest received video track.
		// @type {MediaStreamTrack}
		this._videoTrack = null;

		// Latest received screen track.
		// @type {MediaStreamTrack}
		this._screenTrack = null;

		// Hark instance.
		// @type {Object}
		this._hark = null;

		// Periodic timer for showing video resolution.
		this._videoResolutionTimer = null;
	}

	render()
	{
		const {
			isMe,
			peer,
			videoVisible,
			videoProfile,
			screenVisible,
			screenProfile,
			audioCodec,
			videoCodec,
			screenCodec,
			onChangeDisplayName,
			debugInfo
		} = this.props;

		const {
			volume,
			videoWidth,
			videoHeight,
			screenWidth,
			screenHeight
		} = this.state;

		return (
			<div data-component='PeerView'>			    
				<div className='info'>
					{ debugInfo? 
						<div className={classnames('media', { 'is-me': isMe })}>
							{screenVisible ?
								<div className='box'>
									{audioCodec ?
										<p className='codec'>{audioCodec}</p>
										:null
									}

									{screenCodec ?
										<p className='codec'>{screenCodec} {screenProfile}</p>
										:null
									}

									{(screenVisible && screenWidth !== null) ?
										<p className='resolution'>{screenWidth}x{screenHeight}</p>
										:null
									}
								</div>
								:<div className='box'>
									{audioCodec ?
										<p className='codec'>{audioCodec}</p>
										:null
									}

									{videoCodec ?
										<p className='codec'>{videoCodec} {videoProfile}</p>
										:null
									}

									{(videoVisible && videoWidth !== null) ?
										<p className='resolution'>{videoWidth}x{videoHeight}</p>
										:null
									}
								</div>
							}
						</div>
						:null
					}
					<div className={classnames('peer', { 'is-me': isMe })}>
						{isMe ?
							<EditableInput
								value={peer.displayName}
								propName='displayName'
								className='display-name editable'
								classLoading='loading'
								classInvalid='invalid'
								shouldBlockWhileLoading
								editProps={{
									maxLength   : 20,
									autoCorrect : false,
									spellCheck  : false
								}}
								onChange={({ displayName }) => onChangeDisplayName(displayName)}
							/>
							:
							<span className='display-name'>
								{peer.displayName}
							</span>											
						}
						{debugInfo?
							<div className='row'>
								<span
									className={classnames('device-icon', peer.device.flag)}
								/>
								<span className='device-version'>
									{peer.device.name} {Math.floor(peer.device.version) || null}
								</span>
							</div>		
							:null
						}				
					</div>
				</div>

				<video
					ref='video'
					className={classnames({
						hidden  : !videoVisible && !screenVisible,
						'is-me' : isMe,
						loading : videoProfile === 'none' && screenProfile === 'none'
					})}
					autoPlay
					muted={isMe}
				/>

				{screenVisible ?
					<div className='minivideo'>
						<video
							ref='minivideo'
							className={classnames({
								hidden  : !videoVisible,
								'is-me' : isMe,
								loading : videoProfile === 'none'
							})}
							autoPlay
							muted={isMe}
						/>
					</div>
					:null
				}

				<div className='volume-container'>
					<div className={classnames('bar', `level${volume}`)} />
				</div>

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
		const { audioTrack, videoTrack, screenTrack } = this.props;

		this._setTracks(audioTrack, videoTrack, screenTrack);
	}

	componentWillUnmount()
	{
		if (this._hark)
			this._hark.stop();

		clearInterval(this._videoResolutionTimer);
	}

	componentWillReceiveProps(nextProps)
	{
		const { audioTrack, videoTrack, screenTrack } = nextProps;

		this._setTracks(audioTrack, videoTrack, screenTrack);
	}

	_setTracks(audioTrack, videoTrack, screenTrack)
	{
		if (this._audioTrack === audioTrack &&
			this._videoTrack === videoTrack &&
			this._screenTrack === screenTrack)
			return;

		this._audioTrack = audioTrack;
		this._videoTrack = videoTrack;
		this._screenTrack = screenTrack;

		if (this._hark)
			this._hark.stop();

		clearInterval(this._videoResolutionTimer);
		this._hideVideoResolution();

		const { video, minivideo } = this.refs;

		if (audioTrack || videoTrack || screenTrack)
		{
			const stream = new MediaStream;

			if (audioTrack)
				stream.addTrack(audioTrack);

			if (videoTrack)
				stream.addTrack(videoTrack);

			if (screenTrack)
			{
				const screenStream = new MediaStream;

				screenStream.addTrack(screenTrack);

				video.srcObject = screenStream;
				minivideo.srcObject = stream;
			}
			else
			{
				video.srcObject = stream;
			}

			if (audioTrack)
				this._runHark(stream);

			if (videoTrack)
				this._showVideoResolution();
		}
		else
		{
			video.srcObject = null;
		}
	}

	_runHark(stream)
	{
		if (!stream.getAudioTracks()[0])
			throw new Error('_runHark() | given stream has no audio track');

		this._hark = hark(stream, { play: false });

		// eslint-disable-next-line no-unused-vars
		this._hark.on('volume_change', (dBs, threshold) =>
		{
			// The exact formula to convert from dBs (-100..0) to linear (0..1) is:
			//   Math.pow(10, dBs / 20)
			// However it does not produce a visually useful output, so let exagerate
			// it a bit. Also, let convert it from 0..1 to 0..10 and avoid value 1 to
			// minimize component renderings.
			let volume = Math.round(Math.pow(10, dBs / 85) * 10);

			if (volume === 1)
				volume = 0;

			if (volume !== this.state.volume)
				this.setState({ volume: volume });
		});
	}

	_showVideoResolution()
	{
		this._videoResolutionTimer = setInterval(() =>
		{
			const { videoWidth, videoHeight } = this.state;
			const { video } = this.refs;

			// Don't re-render if nothing changed.
			if (video.videoWidth === videoWidth && video.videoHeight === videoHeight)
				return;

			this.setState(
				{
					videoWidth  : video.videoWidth,
					videoHeight : video.videoHeight
				});
		}, 1000);
	}

	_hideVideoResolution()
	{
		this.setState({ videoWidth: null, videoHeight: null });
	}
}

PeerView.propTypes =
{
	isMe : PropTypes.bool,
	peer : PropTypes.oneOfType(
		[ appPropTypes.Me, appPropTypes.Peer ]).isRequired,
	audioTrack          : PropTypes.any,
	videoTrack          : PropTypes.any,
	screenTrack         : PropTypes.any,
	videoVisible        : PropTypes.bool.isRequired,
	videoProfile        : PropTypes.string,
	screenVisible       : PropTypes.bool.isRequired,
	screenProfile       : PropTypes.string,
	audioCodec          : PropTypes.string,
	videoCodec          : PropTypes.string,
	screenCodec         : PropTypes.string,
	onChangeDisplayName : PropTypes.func,
	debugInfo           : PropTypes.bool.isRequired
};
