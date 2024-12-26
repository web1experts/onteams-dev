import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
    REPORTS_ERROR,
    PROJECT_REPORTS_LIST_SUCCESS,
    MEMBER_REPORTS_LIST_SUCCESS,
    REPORTS_SUCCESS
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
      type: REPORTS_ERROR,
      payload: data.error.message,
    });
  } else {
    console.log('Error two', err)
    dispatch({
      type: REPORTS_ERROR,
      payload: data.message,
    });
  }
}

export const getReportsByMember = (filters) => {

  return async (dispatch) => {
    try {
      const response = await API.apiGet('reports', filters)
      if (response.data && response.data.success) {
        await dispatch({ type: MEMBER_REPORTS_LIST_SUCCESS, payload: response.data });
      } else {
        await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const gerReportsByProject = (filters) => {

  return async (dispatch) => {
    try {
      const response = await API.apiGet('reports', filters)
      if (response.data && response.data.success) {
         await dispatch({ type: PROJECT_REPORTS_LIST_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}