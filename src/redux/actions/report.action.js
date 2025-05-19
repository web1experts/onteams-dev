import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
    REPORTS_ERROR,
    PROJECT_REPORTS_LIST_SUCCESS,
    MEMBER_REPORTS_LIST_SUCCESS,
    REPORTS_SUCCESS,
    MANUAL_TIME_SUCCESS,
    SINGLE_PROJECT_REPORT,
    MANUAL_TIME_LIST,
    MANUAL_ENTRY_DATA
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

export const addManualTime = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('reports','/add_manual_time', payload)
      if (response.data && response.data.success) {
         await dispatch({ type: MANUAL_TIME_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const addRemarkstoProject = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('reports','/add_remarks', payload)
      if (response.data && response.data.success) {
         await dispatch({ type: REPORTS_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getSingleProjectReport = (projectId) => {
  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('reports',`/singleProject/${projectId}`)
      if (response.data && response.data.success) {
         await dispatch({ type: SINGLE_PROJECT_REPORT, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getManualTimeList = () => {
  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('reports',`/manaul-time`)
      if (response.data && response.data.success) {
         await dispatch({ type: MANUAL_TIME_LIST, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const getSingleActivityData = (date, id) => {
  return async (dispatch) => {
    try {
      const response = await API.apiGetByKey('reports',`/manaul-time/${id}`, {date: date})
      if (response.data && response.data.success) {
         await dispatch({ type: MANUAL_ENTRY_DATA, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}

export const updateManualTimeStatus = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPostUrl('reports',`/update-manaul-time`, payload)
      if (response.data && response.data.success) {
         await dispatch({ type: REPORTS_SUCCESS, payload: response.data });
      } else {
         await dispatch({ type: REPORTS_ERROR, payload: response.data.message });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
}