import {
    OPTIONS_ERROR,
    OPTION_SUCCESS,
    CLEAR_MESSAGES,
    ALL_OPTION_SUCCESS
} from "../actions/types";

const initialState = {
    success: false,
    error: false,
    message: null,
    message_variant: null,
};

export default (state = initialState, action) => {
    
    switch (action.type) {
        case OPTION_SUCCESS:
            return {
                ...state,
                success: true,
                option: action.payload.option,
            }
        case ALL_OPTION_SUCCESS: 
            return {
                ...state,
                success: true,
                optionSet: action.payload.optionSet,
            }
        case OPTIONS_ERROR:
            return {
                ...state,
                message: action.payload.message,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES:
            return {
                message: null,
                message_variant: null
            };
        
        default: return state;
    }
};
