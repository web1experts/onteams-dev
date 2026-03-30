import { EMAIL_CHANGE_SUCCESS, EMAIL_ERROR, EMAIL_OTP_SENT, EMAIL_OTP_VERIFIED, CLEAR_MESSAGES, VALIDATE_ACC_PASSWORD_SUCCESS, VALIDATE_ACC_OTP_SUCCESS } from "../actions/types";

const initialState = {
  step: 1,
  message: null,
  error: null,
  success: false
};

export default (state = initialState, action) => {
  switch (action.type) {

    case EMAIL_OTP_SENT:
      return {
        ...state,
        message: action.payload.message,
        message_variant: 'success',
        otp_for: action.payload.otp_for
      };

    case EMAIL_OTP_VERIFIED:
      return {
        ...state,
        otp_for: null,
        old_email_otp_verified: true
      };

    case EMAIL_CHANGE_SUCCESS:
      return {
        ...state,
        email_updated: true,
        message_variant: 'success',
        message: 'Email changed successfully'
      };
    case VALIDATE_ACC_PASSWORD_SUCCESS: 
   
      return {
        message: action.payload.message,
        message_variant: 'success',
        password_validate: true
      }
    case VALIDATE_ACC_OTP_SUCCESS: 
   
      return {
        message: action.payload.message,
        message_variant: 'success',
        account_delelete_otp_verified: true
      }
    case EMAIL_ERROR:
      return {
        ...state,
        message: action.payload,
        message_variant: 'danger'
      };
    case CLEAR_MESSAGES:
        return {
            // ...state,
            message: null,
            message_variant: null,
        };
    default:
      return state;
  }
};