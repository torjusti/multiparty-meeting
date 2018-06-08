const initialState =
{
	toolAreaOpen : false
};

const toolarea = (state = initialState, action) =>
{
	switch (action.type)
	{
		case 'TOGGLE_TOOL_AREA':
		{
			const toolAreaOpen = !state.toolAreaOpen;

			return { ...state, toolAreaOpen };
		}

		default:
			return state;
	}
};

export default toolarea;
