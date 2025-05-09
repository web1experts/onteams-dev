import { ACTIVITY_COMMON_ERROR, LIVE_ACTIVITY_LIST_SUCCESS, RECORDED_ACTIVITY_SUCCESS, RECORDING_DELETE_SUCCESS, CLEAR_MESSAGES } from "../actions/types";

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
        case RECORDING_DELETE_SUCCESS: 
            return {
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            }
        case ACTIVITY_COMMON_ERROR: 
            return {
                message: action.payload,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES :
            return {
                ...state,
                success: '',
                error: '',
                message: null,
                message_variant: null,
            }
        default: return state;
    }
}