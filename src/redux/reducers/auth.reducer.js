import {
    LOGIN_FAILED,
    LOGIN_SUCCESS,
    LOGOUT,
    LOGIN_COMMON_ERROR,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAILED,
    REQUEST_OTP_SUCCESS,
    REQUEST_OTP_FAILED,
    VERIFY_OTP_SUCCESS,
    VERIFY_OTP_FAILED,
    REGISTER_SUCCESS,
    REGISTER_FAILED,
    VERIFY_EMAIL,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAILED,
    VERIFICATION_REQUEST_FAILED,
    VERIFICATION_REQUEST_SUCCESS,
    GET_PERMISSIONS_SUCCESS,
    GET_PERMISSIONS_FAILED,
    CLEAR_MESSAGES,
    USER_WORKSPACE_LIST_SUCCESS,
    USER_WORKSPACE_LIST_FAILED,
    PROFILE_SUCCESS,
    PUT_USER_SUCCESS,
    PUT_USER_FAILED
} from "../actions/types";
import * as auth from '../../helpers/auth';
const token = auth.getToken();

const initialState = {
    token: null,
    loggedIn: token ? true : false,
    userdata: false,
    userCompanies: false,
    success: false,
    message: null,
    message_variant: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                token: action.payload.accessToken,
                loggedIn: true,
                userdata: action.payload.userDetails,
                userCompanies: action.payload.companies,
            };
        case LOGIN_FAILED:
            return {
                ...state,
                message_variant: 'danger',
                message: action.payload,
                loggedIn: false
            };
        case LOGIN_COMMON_ERROR:
            return {
                ...state,
                message_variant: 'danger',
                message: action.payload,
                loggedIn: false
            }
        case REQUEST_OTP_SUCCESS:
            return {
                ...state,
                requestMessage: action.payload.message,
                loggedIn: false,
                message_variant: 'success',
                message: action.payload.message
            }
        case REQUEST_OTP_FAILED:
            return {
                ...state,
                message_variant: 'danger',
                loggedIn: false,
                message: action.payload
            }
        case VERIFICATION_REQUEST_SUCCESS:
            return {
                ...state,
                loggedIn: false,
                message: action.payload.message,
                message_variant: 'success',
            }
        case VERIFICATION_REQUEST_FAILED:
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
                loggedIn: false,
            }
        case VERIFY_OTP_SUCCESS:
            return {
                ...state,
                verifyMessage: action.payload.message,
                loggedIn: false,
                message_variant: 'success',
                message: action.payload.message
            }
        case VERIFY_OTP_FAILED:
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
                loggedIn: false,
            }
        case RESET_PASSWORD_SUCCESS:
            return {
                ...state,
                updateMessage: action.payload.message,
                loggedIn: false,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
            }
        case RESET_PASSWORD_FAILED:
            return {
                ...state,
                message: action.payload,
                loggedIn: false,
                message_variant: 'danger',
            }
        case FORGOT_PASSWORD_SUCCESS:
            return {
                ...state,
                message_variant: 'success',
                message: action.payload,
            }
        case FORGOT_PASSWORD_FAILED:
            return {
                ...state,
                message_variant: 'danger',
                message: action.payload,
            }
        case REGISTER_SUCCESS:
            return {
                ...state,
                token: action.payload.accessToken,
                loggedIn: true,
                userdata: action.payload.userdata,
                message: action.payload.message,
                message_variant: 'success',
            };
        case REGISTER_FAILED:
            return {
                ...state,
                message_variant: 'danger',
                message: action.payload.message,
                statusCode: action.payload.status
            };
        case  VERIFY_EMAIL  :
            
            return {
                ...state,
                verifyemail: action.payload.email_verification,
                message: action.payload?.message,
                message_variant: 'success',
            }
        case CLEAR_MESSAGES : 
            return {
               // ...state,
                message: null,
                message_variant: null,
            }
        case USER_WORKSPACE_LIST_SUCCESS : 
            return {
                ...state,
                userCompanies: action.payload.companies,
            }
        case USER_WORKSPACE_LIST_FAILED : 
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case PROFILE_SUCCESS: 
            return {
                ...state,
                profile: action.payload.profileData

            }
        case PUT_USER_FAILED: 
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case  PUT_USER_SUCCESS  :
        
            return {
                ...state,
                profileUpdate: true,
                profile: action.payload.profileData,
                message: action.payload?.message,
                message_variant: 'success',
            }
        case LOGOUT: return null;
        default: return state;
    }
};
