import { get } from 'lodash';
import API from '../../helpers/api';
import { refreshUserWorkspace } from './auth.actions';
import * as auth from '../../helpers/auth';
import {
    WORKSPACE_CREATE_SUCCESS,
    WORKSPACE_CREATE_FAILED,
    WORKSPACE_COMMON_ERROR,
    WORKSPACE_UPDATE_SUCCESS,
    GET_WORKSPACE_ROLE_SUCCESS,
    LEAVE_WORKSPACE_SUCCESS,
    LEAVE_WORKSPACE_FAILED,
    UPDATE_OWNERSHIP_SUCCESS,
    UPDATE_OWNERSHIP_FAILED,
    WORKSPACE_DELETE_SUCCESS

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
      type: WORKSPACE_COMMON_ERROR,
      payload: data.error.message || data.error,
    });
  } else {
    dispatch({
      type: WORKSPACE_COMMON_ERROR,
      payload: data.message,
    });
  }
}

export const setupworkspace = (payload) => {
    return async (dispatch) => {
      try {
        const response = await API.apiPost('workspace', payload, config)
  
        if (response.data && response.data.success) {
          await auth.setupDashboards( response.data.companies)
          await dispatch({ type: WORKSPACE_CREATE_SUCCESS, payload: response.data });
          dispatch(refreshUserWorkspace())
        } else {
          await dispatch({ type: WORKSPACE_CREATE_FAILED, payload: response.data.message });
        }
      } catch (err) {
        errorRequest(err, dispatch);
      }
    };
  }

  export const updateworkspace = (workspaceId, payload) => {
    return async (dispatch) => {
      try {
        const response = await API.apiPutUrl('workspace',`/update/${workspaceId}`, payload)
  
        if (response.data && response.data.success) {
          //await auth.setupDashboards( response.data.companies)
          await dispatch({ type: WORKSPACE_UPDATE_SUCCESS, payload: response.data });
          dispatch(refreshUserWorkspace())
        } else {
          await dispatch({ type: WORKSPACE_CREATE_FAILED, payload: response.data.message });
        }
      } catch (err) {
        errorRequest(err, dispatch);
      }
    };
  }

  export const getAvailableRolesByWorkspace = ( payload = '' ) => {
    return async (dispatch) => {
      try {
        const response = await API.apiGet('roles', payload, config)
  
        if (response.data && response.data.success) {
          await dispatch({ type: GET_WORKSPACE_ROLE_SUCCESS, payload: response.data });
        }
      } catch (err) {
        errorRequest(err, dispatch);
      }
    };
  }

  export const leaveCompany = (payload) => {
    return async (dispatch) => {
        try {
            const response = await API.apiPost('leavecompany', payload);
            if (response.data && response.data.success) {
                await dispatch({ type: LEAVE_WORKSPACE_SUCCESS, payload: response.data });
                dispatch(refreshUserWorkspace())
            } else {
                await dispatch({ type: LEAVE_WORKSPACE_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const updateOwnership = (payload ) => {
  return async (dispatch) => {
    try {
        const response = await API.apiPut('ownership', payload);
        if (response.data && response.data.success) {
            await dispatch({ type: UPDATE_OWNERSHIP_SUCCESS, payload: response.data });
            dispatch(refreshUserWorkspace())
        } else {
            await dispatch({ type: UPDATE_OWNERSHIP_FAILED, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}

export const deleteWorkspace = (workspaceid) => {
  return async (dispatch) => {
    try {
        const response = await API.apiDeleteUrl('workspace', `/${workspaceid}`);
        if (response.data && response.data.success) {
            await dispatch({ type: WORKSPACE_DELETE_SUCCESS, payload: response.data });
            dispatch(refreshUserWorkspace())
        } else {
            await dispatch({ type: WORKSPACE_COMMON_ERROR, payload: response.data.message });
        }
    } catch (err) {
        errorRequest(err, dispatch);
    }
  }
}