import { 
    SUBSCRIPTION_ERROR,
    SUBSCRIPTION_SUCCESS,
    CLEAR_MESSAGES,
    AUTHORIZE_PAYMENT_SUCCESS,
    ACTIVE_PLAN,
    BILLING_SUCCESS,
    SUBSCRIPTION_DATA,
    SUBSCRIPTION_CANCEL,
    SUBSCRIPTION_SCHEDULED,
    SUBSCRIPTION_UPDATE_SUCCESS,
    SUBSCRIPTION_INVOICE_SUCCESS,
    UPCOMING_INVOICE,
    CLEAR_CLIENT_SECRET
} from "../actions/types";

const initialState = {
    error: null,
    success: false,
    message: null,
    message_variant: null,
    invoice: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_SUCCESS :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            activeSubscription: action.payload.updatedSubscription
        };
    case UPCOMING_INVOICE: {
        return {
            ...state,
            invoicePreview: action.payload.invoiceData
        }
    }
    case SUBSCRIPTION_INVOICE_SUCCESS: {
        return {
            ...state,
            success: true,
            invoice: null,
            InvoiceData: action.payload.InvoiceData
        }
    }
    case SUBSCRIPTION_UPDATE_SUCCESS:
        return {
            ...state,
            success: true,
            invoice: action.payload.invoice,
            
        }
    case SUBSCRIPTION_SCHEDULED :
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            scheduledSubscription: action.payload.subscription
        };    
    case BILLING_SUCCESS: 
        return {
            ...state,
            billing_info: action.payload.billingInfo,
            message: action.payload.message,
            message_variant: 'success',
        }
    case AUTHORIZE_PAYMENT_SUCCESS: 
        return {
            ...state,
            success: 'success',
            authorizeData: action.payload.authorizeData
        }
    case SUBSCRIPTION_ERROR :
        return {
            ...state,
            success: 'error',
            message: action.payload?.message ? action.payload.message : action.payload,
            message_variant: 'danger',
        }
    case ACTIVE_PLAN: 
        return {
            ...state,
            activeSubscription: action.payload.subscription
        }
    case CLEAR_CLIENT_SECRET: 
        return {
            ...state,
            InvoiceData: null,
            message: null,
            message_variant: null,
        }
    case CLEAR_MESSAGES:
        return {
            message: null,
            message_variant: null,
        };
    case SUBSCRIPTION_DATA: 
        return {
            ...state,
            subscriptionData: action.payload.subscription
        }
    case SUBSCRIPTION_CANCEL: 
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            subscriptionCancel: true,
            activeSubscription: action.payload.updatedSubscription
        }
    default: return state;
  }
};
