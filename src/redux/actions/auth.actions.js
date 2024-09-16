import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  LOGOUT,
  LOGIN_COMMON_ERROR,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILED,
  REQUEST_OTP_SUCCESS,
  REQUEST_OTP_FAILED,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILED,
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  VERIFY_EMAIL,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILED,
  VERIFICATION_REQUEST_SUCCESS,
  VERIFICATION_REQUEST_FAILED,
  USER_WORKSPACE_LIST_SUCCESS,
  USER_WORKSPACE_LIST_FAILED,
  PROFILE_SUCCESS,
  PUT_USER_SUCCESS,
  PUT_USER_FAILED
} from "./types";
// console.log('Environment : ', process.env.NODE_ENV)
const config = {
  headers: {
    'Content-Type': "application/json; charset=utf-8"
  }
}
function errorRequest(err, dispatch) {
  let data = get(err, 'response.data', null);
  data = data || get(err, 'response');
  data = data || err;
  if (data.error) {
    console.log('Error one')
    dispatch({
      type: LOGIN_COMMON_ERROR,
      payload: data.error.message,
    });
  } else {
    console.log('Error two', err)
    dispatch({
      type: LOGIN_COMMON_ERROR,
      payload: data.message,
    });
  }
}

export const login = (payload) => {

  return async (dispatch) => {
    try {
      const config = {
        headers: {
          'Content-Type': "application/json; charset=utf-8"
        }
      }

      const response = await API.apiPost('login', payload, config)
    
      if (response.data && response.data.accessToken) {
        await auth.login(response.data.accessToken, response.data.userDetails, response.data.companies);

        await dispatch({ type: LOGIN_SUCCESS, payload: response.data });

      } else if (response.data.email_verification === false) {
        await dispatch({ type: VERIFY_EMAIL, payload: response.data.email_verification });
      } else {
        
        await dispatch({ type: LOGIN_FAILED, payload: response.data.message });
      }
    } catch (err) {
      
      errorRequest(err, dispatch);
    }
  };
}

export function logout() {
  return (dispatch) => {
    try {
      auth.logout();
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const requestOtp = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost('otpRequest', payload);
      if (response.data && response.data.success) {
        await dispatch({ type: REQUEST_OTP_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: REQUEST_OTP_FAILED, payload: response.data.message });
      }
    } catch (error) {
      errorRequest(error, dispatch)
    }
  }
}


export const requestEmailVerification = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost('emailverifyRequest', payload);
      if (response.data && response.data.success) {
        await dispatch({ type: VERIFICATION_REQUEST_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: VERIFICATION_REQUEST_FAILED, payload: response.data.message });
      }
    } catch (error) {
      errorRequest(error, dispatch)
    }
  }
}


export const verifyOtp = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPost('otpverify', payload);
      if (response.data && response.data.success) {
        await dispatch({ type: VERIFY_OTP_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: VERIFY_OTP_FAILED, payload: response.data.message });
      }
    } catch (error) {
      errorRequest(error, dispatch)
    }
  }
}

export const resetPassword = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPatch('resetPassword', payload);
      if (response.data && response.data.success) {
        await dispatch({ type: RESET_PASSWORD_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: RESET_PASSWORD_FAILED, payload: response.data.message });
      }
    } catch (error) {
      errorRequest(error, dispatch)
    }
  }
}

export const authregister = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost('register', payload, config)

      if (response.data && response.data.accessToken) {
        auth.login(response.data.accessToken, response.data.userDetails, response.data.companies);
        await dispatch({ type: REGISTER_SUCCESS, payload: response.data.accessToken, userdata: response.data.userDetails });
      } else if (response.data.email_verification === false) {
        await dispatch({ type: VERIFY_EMAIL, payload: response.data });
      } else {
        await dispatch({ type: REGISTER_FAILED, payload: response.data });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const setupaccount = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost('account_setup', payload, config)

      if (response.data && response.data.accessToken) {
        await auth.login(response.data.accessToken, response.data.userDetails, response.data.companies);
        await dispatch({ type: REGISTER_SUCCESS, payload: response.data });
        
      } else {
        await dispatch({ type: REGISTER_FAILED, payload: response.data });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const forgotpassword = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost('forgotpassword', payload, config)

      if (response.data && response.data.success) {
        await dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: response.data.message });
      } else {
        await dispatch({ type: FORGOT_PASSWORD_FAILED, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const refreshUserWorkspace = () => {
  return async (dispatch) => {
    try {
      const response = await API.apiGet('user_workspaces')
      
      if (response.data && response.data.success) {
        await auth.setupDashboards( response.data.companies)
       
        await dispatch({ type: USER_WORKSPACE_LIST_SUCCESS, payload: response.data });
      } else {
       
        await dispatch({ type: USER_WORKSPACE_LIST_FAILED, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getUserProfile = () => {
  return async (dispatch) => {
    try {
      const response = await API.apiGet('profile')
      
      if (response.data && response.data.success) {
       
       
        await dispatch({ type: PROFILE_SUCCESS, payload: response.data });
      } else {
       
        await dispatch({ type: LOGIN_COMMON_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const updateProfile = (userId, payload) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPutUrl('profile', `/${userId}`, payload);
        if (response.data && response.data.success) {
            await dispatch({ type: PUT_USER_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: PUT_USER_FAILED, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
}
}