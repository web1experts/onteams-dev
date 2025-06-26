import { 
    CREATE_FIELD_SUCCESS,
    CUSTOM_FIELDS_LIST,
    FIELD_COMMON_ERROR,
    CLEAR_MESSAGES,
    UPDATE_FIELD_SUCCESS
} from "../actions/types";

const initialState = {
    error: null,
    getOne: null,
    success: false,
    message: null,
    message_variant: null,
    customeFields: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_FIELD_SUCCESS :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            newField: action.payload.field
        };
    
    case FIELD_COMMON_ERROR: 
        return {
            message: action.payload, 
            message_variant: 'danger',
        }
    case CUSTOM_FIELDS_LIST: 
        return {
            ...state,
            customFields: action.payload.customFields
        }
    case CLEAR_MESSAGES:
        return {
            // ...state,
            message: null,
            message_variant: null,
        };
    case UPDATE_FIELD_SUCCESS: 
        return {
            ...state,
            updatedField: action.payload.field
        }
    default: return state;
  }
};
