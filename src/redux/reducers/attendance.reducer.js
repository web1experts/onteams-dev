import {
    ATTENDANCE_ERROR,
    ATTENDANCE_LIST_SUCCESS,
    CLEAR_MESSAGES,
 } from "../actions/types";

const initialState = {
    attendances: [],
    error: null,
    success:null,
    message: null,
    message_variant: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ATTENDANCE_LIST_SUCCESS:
            return {
                ...state,
                attendances: action.payload.attendanceData
            }
        case ATTENDANCE_ERROR: 
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES:
            return {
                ...state,
                message: null,
                message_variant: null,
                success: null,
                error: null
            };
        default: return state;
    }
}