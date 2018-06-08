import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Appear } from './transitions';
import ActiveSpeaker from './ActiveSpeaker';
import SideBar from './SideBar';
import Me from './Me';
import FilmStrip from './FilmStrip';
import Notifications from './Notifications';
import ChatWidget from './ChatWidget';

export default class Room extends React.Component
{
	render()
	{
		return (
			<Appear duration={300}>
				<div data-component='Room'>
					<div className='room-wrapper'>
						<ActiveSpeaker />

						<SideBar />

						<Me />

						<FilmStrip />

						<ChatWidget />

						<Notifications />
					</div>

					<ReactTooltip
						id='globaltip'
						effect='solid'
						delayShow={100}
						delayHide={100}
						html={Boolean(true)}
					/>
				</div>
			</Appear>
		);
	}
}

Room.propTypes =
{
};
