import { REPORTS_ERROR, MEMBER_REPORTS_LIST_SUCCESS,PROJECT_REPORTS_LIST_SUCCESS, REPORTS_SUCCESS } from "../actions/types";

const initialState = {
    memberReports: [],
    projectReports: [],
    message: null,
    message_variant: null
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
        default: return state;
    }
}