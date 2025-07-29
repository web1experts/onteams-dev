import { 
    SYSTEM_FIELDS_LIST,
    SYSTEM_FIELD_COMMON_ERROR,
    CLEAR_MESSAGES,
    SYSTEM_UPDATE_FIELD_SUCCESS
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
    case SYSTEM_FIELD_COMMON_ERROR: 
        return {
            message: action.payload, 
            message_variant: 'danger',
        }
    case SYSTEM_FIELDS_LIST: 
        if (action.payload.return_type === 'array') {
            return {
            ...state,
            systemFieldsArray: action.payload.customFields,
            };
        } else {
            return {
            ...state,
            systemFieldsObject: action.payload.customFields,
            };
        }
    case CLEAR_MESSAGES:
        return {
            // ...state,
            message: null,
            message_variant: null,
        };
    case SYSTEM_UPDATE_FIELD_SUCCESS: 
        return {
            ...state,
            updatedField: action.payload.field
        }
    default: return state;
  }
};
