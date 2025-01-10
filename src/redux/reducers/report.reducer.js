import { REPORTS_ERROR,REPORTS_SUCCESS, SINGLE_PROJECT_REPORT,MANUAL_TIME_SUCCESS, MEMBER_REPORTS_LIST_SUCCESS,PROJECT_REPORTS_LIST_SUCCESS, CLEAR_MESSAGES } from "../actions/types";

const initialState = {
    memberReports: [],
    projectReports: [],
    message: null,
    message_variant: null,
    singleProjectReport: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case MEMBER_REPORTS_LIST_SUCCESS:
            return {
                ...state,
                memberReports: action.payload.memberReports
            }
        case PROJECT_REPORTS_LIST_SUCCESS: 
            return {
                ...state,
                projectReports: action.payload.projectReports
            }
        case MANUAL_TIME_SUCCESS: 
            return {
                ...state,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            }
        case REPORTS_SUCCESS: 
            return {
                ...state,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            }
        case CLEAR_MESSAGES:
            return {
                ...state,
                message: null,
                message_variant: null,
                success: null,
                error: null,
                singleProjectReport: null
            };
        case SINGLE_PROJECT_REPORT: 
            return {
                ...state,
                singleProjectReport: action.payload.projectReport
            }
        case REPORTS_ERROR: 
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        default: return state;
    }
}