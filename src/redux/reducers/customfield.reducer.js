import { 
    CREATE_FIELD_SUCCESS,
    CUSTOM_FIELDS_LIST,
    FIELD_COMMON_ERROR,
    CLEAR_MESSAGES,
    UPDATE_FIELD_SUCCESS,
    DELETE_FIELD_SUCCESS,
    FIELDS_REORDER
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
            customFields: action.payload.customFields,
            fieldModule: action.payload.module
        };
    case DELETE_FIELD_SUCCESS :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            customFields: action.payload.customFields,
            fieldModule: action.payload.module
        };
    case FIELD_COMMON_ERROR: 
        return {
            message: action.payload, 
            message_variant: 'danger',
        }
    case CUSTOM_FIELDS_LIST: 
        return {
            ...state,
            customFields: action.payload.customFields,
            fieldModule: action.payload.module
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
            customFields: action.payload.customFields,
            fieldModule: action.payload.module
        }
    case FIELDS_REORDER:
        return {
            successfull: true,
            customFields: action.payload.customFields,
            fieldModule: action.payload.module
        }
    default: return state;
  }
};
