import { ACTIVITY_COMMON_ERROR, LIVE_ACTIVITY_LIST_SUCCESS, RECORDED_ACTIVITY_SUCCESS } from "../actions/types";

const initialState = {
    liveactivities: [],
    recordedactivities: [],
    message: null,
    message_variant: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LIVE_ACTIVITY_LIST_SUCCESS:
            return {
                ...state,
                liveactivities: action.payload.activityData
            }
        case RECORDED_ACTIVITY_SUCCESS: 
            return {
                ...state,
                recordedActivity: action.payload.activityData
            }
        default: return state;
    }
}