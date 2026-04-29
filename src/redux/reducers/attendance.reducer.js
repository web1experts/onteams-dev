import {
    ATTENDANCE_ERROR,
    ATTENDANCE_LIST_SUCCESS,
    CLEAR_MESSAGES,
    MEMBER_ATTENDANCE_SUCCESS,
    ATTENDANCE_SUMMARY_SUCCESS,
    ATTENDANCE_EXCEL_SUCCESS,
    ATTENDANCE_STATUS_LIST_SUCCESS,
    ATTENDANCE_STATUS_SAVE_SUCCESS,
    ATTENDANCE_SHIFTS_SAVE_SUCCESS,
    ATTENDANCE_SHIFTS_GET_SUCCESS,
    ATTENDANCE_SHIFT_DELETE_SUCCESS
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
        case ATTENDANCE_STATUS_LIST_SUCCESS:
            return {
                ...state,
                attendanceStatuses: action.payload.attendanceStatuses
            }
        case ATTENDANCE_STATUS_SAVE_SUCCESS: 
            return {
                ...state,
                attendanceStatuses: action.payload.attendanceStatuses,
                message: action.payload.message,
                message_variant: 'success',
                success: true
            }
        case MEMBER_ATTENDANCE_SUCCESS: 
            return {
                ...state,
                memberAttendance: action.payload.attendanceData
            }
        case ATTENDANCE_SHIFTS_SAVE_SUCCESS: 
            return {
                ...state,
                shiftDetails: action.payload.shiftDetails,
                message: 'Shift saved successfully.',
                message_variant: 'success',
            }
        case ATTENDANCE_SHIFTS_GET_SUCCESS: 
            return {
                ...state,
                shiftDetails: action.payload.shiftDetails
            }
        case ATTENDANCE_SHIFT_DELETE_SUCCESS: 
            return {
                ...state,
                shiftDetails: action.payload.shiftDetails,
                message: 'Shift deleted successfully.',
                message_variant: 'success',
            }
        case ATTENDANCE_EXCEL_SUCCESS: 
            return {
                ...state,
                exceldata: action.payload.attendanceData
            }
        case ATTENDANCE_SUMMARY_SUCCESS: 
            return {
                ...state,
                attendanceSummary: action.payload.summary
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