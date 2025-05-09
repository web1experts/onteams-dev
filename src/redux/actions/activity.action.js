import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
    ACTIVITY_COMMON_ERROR,
    LIVE_ACTIVITY_LIST_SUCCESS,
    RECORDED_ACTIVITY_SUCCESS,
    RECORDING_DELETE_SUCCESS
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
      type: ACTIVITY_COMMON_ERROR,
      payload: data.error.message,
    });
  } else {
    console.log('Error two', err)
    dispatch({
      type: ACTIVITY_COMMON_ERROR,
      payload: data.message,
    });
  }
}

export const getliveActivity = (payload) => {

  return async (dispatch) => {
    try {

      const response = await API.apiPost('activity', payload)
    
      if (response.data && response.data.success) {
        await dispatch({ type: LIVE_ACTIVITY_LIST_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: ACTIVITY_COMMON_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getRecoredActivity = (id, status, filtereddate) => {

  return async (dispatch) => {
    try {

      const response = await API.apiPost('activity', { id: id, status: status, date_range: filtereddate })
    
      if (response.data && response.data.success) {
         await dispatch({ type: RECORDED_ACTIVITY_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: ACTIVITY_COMMON_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const deleteRecoredActivity = (payload) => {

  return async (dispatch) => {
    try {

      const response = await API.apiDeleteUrl('activity', '/recordings', payload)
    
      if (response.data && response.data.success) {
         await dispatch({ type: RECORDING_DELETE_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: ACTIVITY_COMMON_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}