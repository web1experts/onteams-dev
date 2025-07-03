import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    ATTENDANCE_ERROR,
    ATTENDANCE_LIST_SUCCESS,
    MEMBER_ATTENDANCE_SUCCESS,
    ATTENDANCE_SUMMARY_SUCCESS,
    ATTENDANCE_EXCEL_SUCCESS
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