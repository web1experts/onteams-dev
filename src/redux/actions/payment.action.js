import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
    SUBSCRIPTION_ERROR,
    SUBSCRIPTION_SUCCESS,
    AUTHORIZE_PAYMENT_SUCCESS,
    AUTHORIZE_PAYMENT_FAIL
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
      type: SUBSCRIPTION_ERROR,
      payload: data.error.message,
    });
  } else {
    console.log('Error two', err)
    dispatch({
      type: SUBSCRIPTION_ERROR,
      payload: data.message,
    });
  }
}

export const handleAuthorizePayment = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('payment', '/authorize' , payload)
      if (response.data && response.data.success) {
        await dispatch({ type: AUTHORIZE_PAYMENT_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}


export const handleStripeAuthorizePayment = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('payment', '/authorize-stripe' , payload)
      if (response.data && response.data.success) {
        await dispatch({ type: AUTHORIZE_PAYMENT_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}
