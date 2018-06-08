import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { getDeviceInfo } from 'mediasoup-client';
import * as appPropTypes from './appPropTypes';
import * as requestActions from '../redux/requestActions';
import Draggable from 'react-draggable';
import PeerView from './PeerView';

class Me extends React.Component
{
	constructor(props)
	{
		super(props);

		this._mounted = false;
		this._rootNode = null;
		this._tooltip = true;

		// TODO: Issue when using react-tooltip in Edge:
		//   https://github.com/wwayne/react-tooltip/issues/328
		if (getDeviceInfo().flag === 'msedge')
			this._tooltip = false;
	}

	render()
	{
		const {
			connected,
			me,
			micProducer,
			webcamProducer,
			screenProducer,
			onChangeDisplayName,
			onMuteMic,
			onUnmuteMic,
			onEnableWebcam,
			onDisableWebcam,
			onChangeWebcam
		} = this.props;

		let micState;

		if (!me.canSendMic)
			micState = 'unsupported';
		else if (!micProducer)
			micState = 'unsupported';
		else if (!micProducer.locallyPaused && !micProducer.remotelyPaused)
			micState = 'on';
		else
			micState = 'off';

		let webcamState;

		if (!me.canSendWebcam)
			webcamState = 'unsupported';
		else if (webcamProducer)
			webcamState = 'on';
		else
			webcamState = 'off';

		let changeWebcamState;

		if (Boolean(webcamProducer) && me.canChangeWebcam)
			changeWebcamState = 'on';
		else
			changeWebcamState = 'unsupported';

		const videoVisible = (
			Boolean(webcamProducer) &&
			!webcamProducer.locallyPaused &&
			!webcamProducer.remotelyPaused
		);

		const screenVisible = (
			Boolean(screenProducer) &&
			!screenProducer.locallyPaused &&
			!screenProducer.remotelyPaused
		);

		let tip;

		if (!me.displayNameSet)
			tip = 'Click on your name to change it';

		return (
			<Draggable handle='.me-handle' bounds='body'>
				<div
					data-component='Me'
					ref={(node) => (this._rootNode = node)}
					data-for='globaltip'
					data-tip={tip}
					data-tip-disable={!tip}
					data-type='dark'
				>
					<div className='me-handle'>
						<span>Me</span>
						{connected ?
							<div className='controls'>
								<div
									className={classnames('button', 'mic', micState)}
									onClick={() =>
									{
										micState === 'on' ? onMuteMic() : onUnmuteMic();
									}}
								/>

								<div
									className={classnames('button', 'webcam', webcamState, {
										disabled : me.webcamInProgress
									})}
									onClick={() =>
									{
										webcamState === 'on' ? onDisableWebcam() : onEnableWebcam();
									}}
								/>
							</div>
							:null
						}
					</div>

					<PeerView
						isMe
						peer={me}
						audioTrack={micProducer ? micProducer.track : null}
						videoTrack={webcamProducer ? webcamProducer.track : null}
						screenTrack={screenProducer ? screenProducer.track : null}
						videoVisible={videoVisible}
						screenVisible={screenVisible}
						audioCodec={micProducer ? micProducer.codec : null}
						videoCodec={webcamProducer ? webcamProducer.codec : null}
						onChangeDisplayName={(displayName) => onChangeDisplayName(displayName)}
					/>
				</div>
			</Draggable>
		);
	}

	componentDidMount()
	{
		this._mounted = true;

		if (this._tooltip)
		{
			setTimeout(() =>
			{
				if (!this._mounted || this.props.me.displayNameSet)
					return;

				ReactTooltip.show(this._rootNode);
			}, 4000);
		}
	}

	componentWillUnmount()
	{
		this._mounted = false;
	}

	componentWillReceiveProps(nextProps)
	{
		if (this._tooltip)
		{
			if (nextProps.me.displayNameSet)
				ReactTooltip.hide(this._rootNode);
		}
	}
}

Me.propTypes =
{
	connected           : PropTypes.bool.isRequired,
	me                  : appPropTypes.Me.isRequired,
	micProducer         : appPropTypes.Producer,
	webcamProducer      : appPropTypes.Producer,
	screenProducer      : appPropTypes.Producer,
	onChangeDisplayName : PropTypes.func.isRequired,
	onMuteMic           : PropTypes.func.isRequired,
	onUnmuteMic         : PropTypes.func.isRequired,
	onEnableWebcam      : PropTypes.func.isRequired,
	onDisableWebcam     : PropTypes.func.isRequired,
	onChangeWebcam      : PropTypes.func.isRequired
};

const mapStateToProps = (state) =>
{
	const producersArray = Object.values(state.producers);
	const micProducer =
		producersArray.find((producer) => producer.source === 'mic');
	const webcamProducer =
		producersArray.find((producer) => producer.source === 'webcam');
	const screenProducer =
		producersArray.find((producer) => producer.source === 'screen');

	return {
		connected      : state.room.state === 'connected',
		me             : state.me,
		micProducer    : micProducer,
		webcamProducer : webcamProducer,
		screenProducer : screenProducer
	};
};

const mapDispatchToProps = (dispatch) =>
{
	return {
		onChangeDisplayName : (displayName) =>
		{
			dispatch(requestActions.changeDisplayName(displayName));
		},
		onMuteMic       : () => dispatch(requestActions.muteMic()),
		onUnmuteMic     : () => dispatch(requestActions.unmuteMic()),
		onEnableWebcam  : () => dispatch(requestActions.enableWebcam()),
		onDisableWebcam : () => dispatch(requestActions.disableWebcam()),
		onChangeWebcam  : () => dispatch(requestActions.changeWebcam())
	};
};

const MeContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Me);

export default MeContainer;
