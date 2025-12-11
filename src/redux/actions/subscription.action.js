import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
    SUBSCRIPTION_ERROR,
    SUBSCRIPTION_SUCCESS,
    AUTHORIZE_PAYMENT_SUCCESS,
    SUBSCRIPTION_UPDATE_SUCCESS,
    BILLING_SUCCESS,
    ACTIVE_PLAN,
    SUBSCRIPTION_CANCEL,
    SUBSCRIPTION_DATA,
    SUBSCRIPTION_SCHEDULED
} from "./types";
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
export const createSubscription = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('subscription', '/create' , payload)
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

export const saveAuthorization = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('subscription', '/save' , payload)
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const subscribeFreePlan = () => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('subscription', '/free', {})
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
}
 
}

export const cancelSubscription = (subscriptionId) => {

  return async (dispatch) => {
    try {
      const response = await API.apiDeleteUrl('subscription', `/${subscriptionId}`)
      if (response.data && response.data.success) {
        await auth.removeSubscription()
        await dispatch({ type: SUBSCRIPTION_CANCEL, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}

export const getScheduledPlan = (subscriptionId) => {

  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('subscription', '/scheduled-plan')
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_SCHEDULED, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}


export const subscribeTrialPlan = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('subscription', '/trial', payload)
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}

export const saveBillingDetails = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('subscription', '/save-billing-details', payload)
      if (response.data && response.data.success) {
        await dispatch({ type: BILLING_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}

export const getBillingdetails = () => {

  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('subscription', '/billing-details', {})
      if (response.data && response.data.success) {
        await dispatch({ type: BILLING_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}


export const updateSubscription = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPutUrl('subscription', '/update', payload)
      if (response.data && response.data.success) {
        await dispatch({ type: AUTHORIZE_PAYMENT_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}

export const updateQuantity = (payload) => {

  return async (dispatch) => {
    try {
      const response = await API.apiPutUrl('subscription', '/update-qty', payload)
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  }
}

export const getActiveSubscription = () => {

  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('subscription', '/active-subscription')
      if (response.data && response.data.success) {
        await dispatch({ type: ACTIVE_PLAN, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getActiveSubscriptionDetails = () => {

  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('subscription', '/susbscription-details')
      if (response.data && response.data.success) {
        await dispatch({ type: SUBSCRIPTION_DATA, payload: response.data });
      } else {
        await dispatch({ type: SUBSCRIPTION_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}