import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
  LOGIN_COMMON_ERROR,
  GET_PERMISSIONS_SUCCESS,
  GET_PERMISSIONS_FAILED,
  PERMISSIONS_FAILED,
  PERMISSIONS_SUCCESS,
  ROLE_DELETE_SUCCESS,
  ROLE_SUCCESS
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
    dispatch({
      type: PERMISSIONS_FAILED,
      payload: data.error.message,
    });
  } else {
    dispatch({
      type: PERMISSIONS_FAILED,
      payload: data.message,
    });
  }
}


export const updatePermissions = (payload) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPut('permissions', payload);
        if (response.data && response.data.success) {
            await dispatch({ type: PERMISSIONS_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: PERMISSIONS_FAILED, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}


export const addRoleWithPermissions = (payload) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPost('roles', payload);
        if (response.data && response.data.success) {
            await dispatch({ type: ROLE_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: PERMISSIONS_FAILED, payload: response.data.error });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}

export const deleteRole = (roleId) => {
  return async (dispatch) => {
    try {
        const response = await API.apiDeleteUrl('roles', `/${roleId}`);
        if (response.data && response.data.success) {
            await dispatch({ type: ROLE_DELETE_SUCCESS, payload: response.data });
        } else {
            await dispatch({ type: PERMISSIONS_FAILED, payload: response.data.error });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}