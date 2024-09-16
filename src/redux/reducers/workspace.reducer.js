import {
    WORKSPACE_CREATE_SUCCESS,
    WORKSPACE_CREATE_FAILED,
    WORKSPACE_COMMON_ERROR ,
    GET_WORKSPACE_ROLE_SUCCESS,
    CLEAR_MESSAGES,
    LEAVE_WORKSPACE_SUCCESS,
    LEAVE_WORKSPACE_FAILED,
    UPDATE_OWNERSHIP_SUCCESS,
    UPDATE_OWNERSHIP_FAILED,
    WORKSPACE_UPDATE_SUCCESS,
    WORKSPACE_DELETE_SUCCESS,
    REFRESH_DASHBOARDS
} from "../actions/types";
import * as auth from '../../helpers/auth';
const token = auth.getToken();

const initialState = {
    success: false,
    error: false,
    message: null,
    message_variant: null,
    available_roles: [],
};

export default (state = initialState, action) => {
    
    switch (action.type) {
        case WORKSPACE_CREATE_SUCCESS:
            return {
                message: action.payload.message,
                message_variant: 'success',
                success: true,
                companies: action.payload.companies
            };
        case WORKSPACE_CREATE_FAILED:
            return {
                message: action.payload.message,
                message_variant: 'danger',
            };
        case WORKSPACE_UPDATE_SUCCESS: 
            return {
                message: action.payload.message,
                message_variant: 'success',
                success: true
            }
        case WORKSPACE_COMMON_ERROR:
            return {
                message: action.payload.message,
                message_variant: 'danger',
                loggedIn: false
            }
        case GET_WORKSPACE_ROLE_SUCCESS:
            return {
                available_roles: action.payload.roles
            }
        case CLEAR_MESSAGES:
            return {
                // ...state,
                message: null,
                message_variant: null
            };
        case LEAVE_WORKSPACE_SUCCESS:
            return {
                message: action.payload.message,
                message_variant: 'success',
                success: true,
            };
        case LEAVE_WORKSPACE_FAILED:
            return {
                message: action.payload,
                message_variant: 'danger',
            };
        case UPDATE_OWNERSHIP_SUCCESS : 
            return {
                message_variant: 'success',
                message: action.payload.message
            }
        case UPDATE_OWNERSHIP_FAILED : 
            return {
                message_variant: 'danger',
                message: action.payload
            }
        case WORKSPACE_DELETE_SUCCESS : 
            return {
                message_variant: 'success',
                message: action.payload.message,
                success: true
            }
        case REFRESH_DASHBOARDS: 
            return {
                updateDashboard: true
            }
        default: return state;
    }
};
