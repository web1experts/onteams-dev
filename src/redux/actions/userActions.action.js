import { get } from 'lodash';
import API from '../../helpers/api';
import { EMAIL_CHANGE_SUCCESS, EMAIL_ERROR, EMAIL_OTP_SENT, EMAIL_OTP_VERIFIED, VALIDATE_ACC_PASSWORD_SUCCESS, VALIDATE_ACC_OTP_SUCCESS } from "./types";

function errorRequest(err, dispatch) {
    let data = get(err, 'response.data', null);
    data = data || get(err, 'response');
    data = data || err;
    if(data.error){
        dispatch({
            type: EMAIL_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: EMAIL_ERROR,
            payload: data.message,
    });
  }
}
export const verifyNewOtp = (otp) => async (dispatch) => {
  try {
    const res = await API.apiPostUrl('useractions', '/verify-new-email-otp', { otp });

    if (res.data.success) {
      dispatch({ type: EMAIL_CHANGE_SUCCESS });
    } else {
      dispatch({ type: EMAIL_ERROR, payload: res.data.message });
    }
  } catch (err) {
    errorRequest(err, dispatch);
  }
};

export const sendNewEmailOtp = (newEmail) => async (dispatch) => {
  try {
    const res = await API.apiPostUrl('useractions', '/send-new-email-otp', { newEmail });

    if (res.data.success) {
      dispatch({ type: EMAIL_OTP_SENT, payload: res.data });
    } else {
      dispatch({ type: EMAIL_ERROR, payload: res.data.message });
    }
  } catch (err) {
    errorRequest(err, dispatch);
  }
};

export const verifyOldOtp = (otp) => async (dispatch) => {
  try {
    const res = await API.apiPostUrl('useractions', '/verify-old-email-otp', { otp });

    if (res.data.success) {
      dispatch({ type: EMAIL_OTP_VERIFIED });
    } else {
      dispatch({ type: EMAIL_ERROR, payload: res.data.message });
    }
  } catch (err) {
    errorRequest(err, dispatch);
  }
};

export const sendOldEmailOtp = () => async (dispatch) => {
  try {
    const res = await API.apiPostUrl('useractions', '/send-old-email-otp');

    if (res.data.success) {
      dispatch({ type: EMAIL_OTP_SENT, payload: res.data });
    }else{
        await dispatch({ type: EMAIL_ERROR, payload: res.data.message });
    }
  } catch (err) {
    errorRequest(err, dispatch);
  }
};

export const validateAccountPassword = (payload) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPostUrl('useractions', `/validate-password-send-otp`, payload);
        if (response.data && response.data.success) {
            await dispatch({ type: VALIDATE_ACC_PASSWORD_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: EMAIL_ERROR, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}

export const validateAccountDeleteOTP = (payload) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPostUrl('useractions', `/validate-account-delete-otp`, payload);
        if (response.data && response.data.success) {
            await dispatch({ type: VALIDATE_ACC_OTP_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: EMAIL_ERROR, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}