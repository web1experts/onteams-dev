import { 
    SUBSCRIPTION_ERROR,
    SUBSCRIPTION_SUCCESS,
    CLEAR_MESSAGES,
    AUTHORIZE_PAYMENT_SUCCESS
} from "../actions/types";

const initialState = {
    error: null,
    success: false,
    message: null,
    message_variant: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_SUCCESS :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true
        };
    case AUTHORIZE_PAYMENT_SUCCESS: 
        return {
            ...state,
            authorizeData: action.payload.authorizeData
        }
    case SUBSCRIPTION_ERROR :
        return {
            ...state,
            message: action.payload.message ? action.payload.message : action.payload,
            message_variant: 'danger',
        }
    case CLEAR_MESSAGES:
        return {
            message: null,
            message_variant: null,
        };
    default: return state;
  }
};
