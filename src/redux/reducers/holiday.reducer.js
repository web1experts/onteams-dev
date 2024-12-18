import { HOLIDAY_ERROR,
    HOLIDAY_LIST_SUCCESS,
    CREATE_HOLIDAY_SUCCESS,
    CLEAR_MESSAGES,
    HOLIDAY_DELETE_SUCCESS
 } from "../actions/types";

const initialState = {
    holidays: [],
    error: null,
    success:null,
    message: null,
    message_variant: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case HOLIDAY_LIST_SUCCESS:
            return {
                ...state,
                holidays: action.payload.holidaysData
            }
        case CREATE_HOLIDAY_SUCCESS: 
            return {
                ...state,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            }
        case HOLIDAY_ERROR: 
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES:
            return {
                ...state,
                message: null,
                message_variant: null,
                success: null,
                error: null
            };
        case HOLIDAY_DELETE_SUCCESS:
            return {
                ...state,
                deletedHoliday: action.payload.message,
                message: action.payload.message,
                message_variant: 'success',
                success: true,
            }
        default: return state;
    }
}