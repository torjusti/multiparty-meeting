import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as appPropTypes from './appPropTypes';
import classnames from 'classnames';
import * as requestActions from '../redux/requestActions';

class SideBar extends React.Component
{
	render()
	{
		const {
			me,
			screenProducer,
			onSetAudioMode,
			onRestartIce,
			onShareScreen,
			onUnShareScreen,
			onNeedExtension,
			onToggleHand,
			onLeaveMeeting
		} = this.props;

		let screenState;
		let screenTip;

		if (me.needExtension)
		{
			screenState = 'need-extension';
			screenTip = 'Install screen sharing extension';
		}
		else if (!me.canShareScreen)
		{
			screenState = 'unsupported';
			screenTip = 'Screen sharing not supported';
		}
		else if (screenProducer)
		{
			screenState = 'on';
			screenTip = 'Stop screen sharing';
		}
		else
		{
			screenState = 'off';
			screenTip = 'Start screen sharing';
		}

		return (
			<div data-component='SideBar'>
				<div
					className={classnames('button', 'screen', screenState)}
					data-tip={screenTip}
					data-type='dark'
					data-for='globaltip'
					onClick={() =>
					{
						switch (screenState)
						{
							case 'on':
							{
								onUnShareScreen();
								break;
							}
							case 'off':
							{
								onShareScreen();
								break;
							}
							case 'need-extension':
							{
								onNeedExtension();
								break;
							}
							default:
							{
								break;
							}
						}
					}}
				/>

				<div
					className={classnames('button', 'raise-hand', {
						on       : me.raiseHand,
						disabled : me.raiseHandInProgress
					})}
					data-tip='Raise hand'
					data-type='dark'
					data-for='globaltip'
					onClick={() => onToggleHand(!me.raiseHand)}
				/>

				<div
					className={classnames('button', 'leave-meeting')}
					data-tip='Leave meeting'
					data-type='dark'
					data-for='globaltip'
					onClick={() => onLeaveMeeting()}
				/>
			</div>
		);
	}
}

SideBar.propTypes =
{
	me              : appPropTypes.Me.isRequired,
	screenProducer  : appPropTypes.Producer,
	onSetAudioMode  : PropTypes.func.isRequired,
	onRestartIce    : PropTypes.func.isRequired,
	onShareScreen   : PropTypes.func.isRequired,
	onUnShareScreen : PropTypes.func.isRequired,
	onNeedExtension : PropTypes.func.isRequired,
	onToggleHand    : PropTypes.func.isRequired,
	onLeaveMeeting  : PropTypes.func.isRequired
};

const mapStateToProps = (state) =>
{
	const producersArray = Object.values(state.producers);
	const screenProducer =
		producersArray.find((producer) => producer.source === 'screen');

	return {
		me             : state.me,
		screenProducer : screenProducer
	};
};

const mapDispatchToProps = (dispatch) =>
{
	return {
		onSetAudioMode : (enable) =>
		{
			if (enable)
				dispatch(requestActions.enableAudioOnly());
			else
				dispatch(requestActions.disableAudioOnly());
		},
		onRestartIce : () =>
		{
			dispatch(requestActions.restartIce());
		},
		onToggleHand : (enable) =>
		{
			if (enable)
				dispatch(requestActions.raiseHand());
			else
				dispatch(requestActions.lowerHand());
		},
		onLeaveMeeting : () =>
		{
			dispatch(requestActions.leaveRoom());
		},
		onShareScreen : () =>
		{
			dispatch(requestActions.enableScreenSharing());
		},
		onUnShareScreen : () =>
		{
			dispatch(requestActions.disableScreenSharing());
		},
		onNeedExtension : () =>
		{
			dispatch(requestActions.installExtension());
		}
	};
};

const SideBarContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(SideBar);

export default SideBarContainer;
