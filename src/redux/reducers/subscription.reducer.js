import { 
    SUBSCRIPTION_ERROR,
    SUBSCRIPTION_SUCCESS,
    CLEAR_MESSAGES,
    AUTHORIZE_PAYMENT_SUCCESS,
    ACTIVE_PLAN
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
            success: true,
            activeSubscription: action.payload.updatedSubsciption
        };
    case AUTHORIZE_PAYMENT_SUCCESS: 
        return {
            ...state,
            success: 'success',
            authorizeData: action.payload.authorizeData
        }
    case SUBSCRIPTION_ERROR :
        return {
            ...state,
            message: action.payload?.message ? action.payload.message : action.payload,
            message_variant: 'danger',
        }
    case ACTIVE_PLAN: 
        return {
            ...state,
            activeSubscription: action.payload.subscription
        }
    case CLEAR_MESSAGES:
        return {
            message: null,
            message_variant: null,
        };
    default: return state;
  }
};
