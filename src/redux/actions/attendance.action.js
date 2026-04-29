import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    ATTENDANCE_ERROR,
    ATTENDANCE_LIST_SUCCESS,
    MEMBER_ATTENDANCE_SUCCESS,
    ATTENDANCE_SUMMARY_SUCCESS,
    ATTENDANCE_EXCEL_SUCCESS,
    ATTENDANCE_STATUS_LIST_SUCCESS,
    ATTENDANCE_STATUS_SAVE_SUCCESS,
    ATTENDANCE_SHIFTS_SAVE_SUCCESS,
    ATTENDANCE_SHIFTS_GET_SUCCESS,
    ATTENDANCE_SHIFT_DELETE_SUCCESS
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
    if(data.error){
        dispatch({
            type: ATTENDANCE_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: ATTENDANCE_ERROR,
            payload: data.message,
    });
  }
}

/**
 * @function ListAttendance
 * @returns {Object}
 */
export const ListAttendance = (filters) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('attendance', filters);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_LIST_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const ListAttendanceStatuses = () => {
    return async (dispatch) => {
        try{
            const response = await API.apiGetByKey('attendance', '/statuses');
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_STATUS_LIST_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const getAttendanceByMember = (memberId, filters) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGetByKey('attendance', `/member/${memberId}`, filters);
            if(response.data && response.data.success){
            await dispatch({ type: MEMBER_ATTENDANCE_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const getAttendanceSummary = (payload) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGetByKey('attendance', `/summary`, payload);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_SUMMARY_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const getMonthlyAttendanceExcelView = (payload) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGetByKey('attendance', `/excel`, payload);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_EXCEL_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const saveAttendanceStatuses = (payload) => {
    return async (dispatch) => {
        try{
            const response = await API.apiPostUrl('attendance', `/status`, payload);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_STATUS_SAVE_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const handleSaveShifts = (payload) => {
    return async (dispatch) => {
        try{
            const response = await API.apiPostUrl('attendance', `/shifts`, payload);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_SHIFTS_SAVE_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const getShifts = () => {
    return async (dispatch) => {
        try{
            const response = await API.apiGetByKey('attendance', `/shifts`);
            if(response.data && response.data.success){
            await dispatch({ type: ATTENDANCE_SHIFTS_GET_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: ATTENDANCE_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}

export const deleteShift = (shiftId) => {
  return async (dispatch) => {
    try {
      const response = await API.apiDeleteUrl(
        "attendance",
        `/shifts/${shiftId}`
      );

      if (response.data && response.data.success) {
        await dispatch({
          type: ATTENDANCE_SHIFT_DELETE_SUCCESS,
          payload: response.data, // remove from store using id
        });
      } else {
        await dispatch({
          type: ATTENDANCE_ERROR,
          payload: response.data.message,
        });
      }
    } catch (error) {
      errorRequest(error, dispatch);
    }
  };
};