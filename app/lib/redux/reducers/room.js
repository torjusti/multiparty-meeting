const initialState =
{
	url                   : null,
	state                 : 'new', // new/connecting/connected/disconnected/closed,
	activeSpeakerName     : null,
	lastActiveSpeakerName : null,
	videoSpotlightName    : null,
	peerHeight            : 240,
	peerWidth             : 320
};

const room = (state = initialState, action) =>
{
	switch (action.type)
	{
		case 'SET_ROOM_URL':
		{
			const { url } = action.payload;

			return { ...state, url };
		}

		case 'SET_ROOM_STATE':
		{
			const roomState = action.payload.state;

			if (roomState == 'connected')
				return { ...state, state: roomState };
			else
				return { ...state, state: roomState, activeSpeakerName: null };
		}

		case 'SET_ROOM_ACTIVE_SPEAKER':
		{
			const { peerName } = action.payload;

			if (peerName)
				return { ...state, activeSpeakerName: peerName, lastActiveSpeakerName: peerName };
			else
				return { ...state, activeSpeakerName: peerName };
		}

		case 'SET_COMPONENT_SIZE':
		{
			const { peerWidth, peerHeight } = action.payload;

			return { ...state, peerWidth: peerWidth, peerHeight: peerHeight };
		}

		case 'SET_VIDEO_SPOTLIGHT':
		{
			const { peerName } = action.payload;

			if (state.videoSpotlightName === peerName)
				return { ...state, videoSpotlightName: null };

			return { ...state, videoSpotlightName: peerName };
		}

		default:
			return state;
	}
};

export default room;
