import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    HOLIDAY_ERROR,
    HOLIDAY_LIST_SUCCESS,
    CREATE_HOLIDAY_SUCCESS,
    HOLIDAY_DELETE_SUCCESS
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
            type: HOLIDAY_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: HOLIDAY_ERROR,
            payload: data.message,
    });
  }
}

/**
 * @function ListClients
 * @returns {Object}
 */
export const ListHolidays = (currentPage = 0, searchterm = "") => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('holidays', { search: searchterm, currentPage:currentPage });
            if(response.data && response.data.success){
            await dispatch({ type: HOLIDAY_LIST_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: HOLIDAY_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createHoliday = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('holidays', payload , config);
            if(response.data && response.data.success){
                await dispatch({ type: CREATE_HOLIDAY_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: HOLIDAY_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const deleteHoliday = (holidayId) => {

    return async (dispatch) => {
        try {
            const response = await API.apiDeleteUrl('holidays', `/${holidayId}`);
            if (response.data && response.data.success) {
                await dispatch({ type: HOLIDAY_DELETE_SUCCESS, payload: response.data });
            } else {
                await dispatch({ type: HOLIDAY_ERROR, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const updateHoliday  = (holidayId, payload) => {
    
    return async (dispatch) => {
      try {
        const response = await API.apiPutUrl('holidays', `/update/${holidayId}`, payload);
        if(response.data && response.data.success){
          await dispatch({ type: CREATE_HOLIDAY_SUCCESS, payload: response.data});
        } else {
          await dispatch({ type: HOLIDAY_ERROR, payload: response.data.message });
        }
      } catch (error) {
        errorRequest(error, dispatch);
      }
    }
  }
