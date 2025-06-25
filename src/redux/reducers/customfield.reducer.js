import { 
    CREATE_FIELD_SUCCESS,
    CREATE_FIELD_FAILED,
    FIELD_COMMON_ERROR,
    CLEAR_MESSAGES
} from "../actions/types";

const initialState = {
    error: null,
    getOne: null,
    success: false,
    message: null,
    message_variant: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_FIELD_SUCCESS :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true
        };
    case CREATE_FIELD_FAILED :
        return {
            ...state,
            message: action.payload.message ? action.payload.message : action.payload,
            message_variant: 'danger',
        }
    
    case FIELD_COMMON_ERROR: 
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
