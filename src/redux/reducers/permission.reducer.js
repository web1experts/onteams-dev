import {
    GET_PERMISSIONS_SUCCESS,
    GET_PERMISSIONS_FAILED,
    PERMISSIONS_FAILED,
    PERMISSIONS_SUCCESS,
    ROLE_SUCCESS,
    CLEAR_MESSAGES
} from "../actions/types";
import * as auth from '../../helpers/auth';

const initialState = {
    success: null,
    statusCode: null,
    currentMember: {}
};

export default (state = initialState, action) => {
    
    switch (action.type) {
        
        case  GET_PERMISSIONS_SUCCESS  :
            return {
                currentMember: action.payload.memberdata
        }
        case PERMISSIONS_SUCCESS: 
            return {
                ...state,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                updatedMember: action.payload?.updatedMember || false,
                savedrole: action.payload?.savedRole ||  false
            }
        case PERMISSIONS_FAILED: 
        return {
            ...state,
            success: false,
            message: action.payload,
            message_variant: 'error'
        }
        case ROLE_SUCCESS: 
            return {
                ...state,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                savedrole: action.payload.savedrole
            }
        case CLEAR_MESSAGES: {
            return {
                ...state,
                success: null,
                message: null,
                message_variant: null
            }
        }
        default: return state;
    }
};
