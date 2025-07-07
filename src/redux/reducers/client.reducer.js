import { 
    CREATE_CLIENT_SUCCESS,
    CREATE_CLIENT_FAILED,
    LIST_CLIENT_SUCCESS,
    LIST_CLIENT_FAILED,
    PUT_CLIENT_SUCCESS,
    PUT_CLIENT_FAILED,
    DELETE_CLIENT_SUCCESS,
    DELETE_CLIENT_FAILED,
    GET_SINGLE_CLIENT_SUCCESS,
    GET_SINGLE_CLIENT_FAILED,
    CLIENT_COMMON_ERROR,
    CLEAR_MESSAGES
} from "../actions/types";

const initialState = {
    error: null,
    createClient: null,
    clients: null,
    getOne: null,
    success: false,
    message: null,
    message_variant: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CLIENT_SUCCESS :
        return {
            ...state,
            createClient: action.payload.lastSavedClientId,
            message: action.payload.message,
            message_variant: 'success',
            success: true
        };
    case CREATE_CLIENT_FAILED :
        return {
            ...state,
            message: action.payload.message ? action.payload.message : action.payload,
            message_variant: 'danger',
        }
    case LIST_CLIENT_SUCCESS:
        return {
            clients: action.payload.clientData
        }
    case LIST_CLIENT_FAILED:
        return {
            message: action.payload,
            message_variant: 'danger',
        }
    
    case DELETE_CLIENT_SUCCESS:
        return {
            deletedClient: action.payload.message,
            message: action.payload.message,
            message_variant: 'success',
            success: true
        }
    case DELETE_CLIENT_FAILED:
        return {
            message: action.payload,
            message_variant: 'danger',
        }
    
    case PUT_CLIENT_SUCCESS:
        return {
            updatedClient: action.payload.updatedClient,
            message: action.payload.message,
            message_variant: 'success',
            success: true
        }
    case PUT_CLIENT_FAILED:
        return{
            message: action.payload,
            message_variant: 'danger',
        }
    
    case CLIENT_COMMON_ERROR: 
        return {
            message: action.payload, 
            message_variant: 'danger',
        }
    case CLEAR_MESSAGES:
        return {
            // ...state,
            message: null,
            message_variant: null,
        };
    default: return state;
  }
};
