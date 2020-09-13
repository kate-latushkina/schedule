import { actionTypes } from '../actions';

const initialState = {
  events: [],
};

export default function eventsReducer (state = initialState, action) {
  switch (action.type) {
    case actionTypes.GET_EVENTS_SUCCESS: {
      console.log(action.data)
      return {
        ...state,
        events: action.data, 
      };
    }

    case actionTypes.GET_EVENTS_FAIL: {
      return {
        ...state,
        events: [],
      };
    }

    default: return state;
  }
}