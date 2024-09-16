import { get } from 'lodash';
import API from 'helpers/api';

import { 
    GET_DASHBOARD_STATS_SUCCESS,
    GET_DASHBOARD_STATS_FAILED,
    DASHBOARD_COMMON_ERROR,
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
      type: DASHBOARD_COMMON_ERROR,
      payload: data.error.message,
    });
  }else{
    dispatch({
      type: DASHBOARD_COMMON_ERROR,
      payload: data.message,
    });
  }
}

/**
 * @function listStatistics
 * @returns {Object}
 */
export const listStatistics = (payload) => {
    return async (dispatch) => {
      try{
        // const queryString = new URLSearchParams(payload).toString();
        // console.log(queryString);
        const response = await API.apiGet('statistics', payload);
        if(response.data && response.data.success){
          await dispatch({ type: GET_DASHBOARD_STATS_SUCCESS, payload: response.data })
        }else{
          await dispatch({ type: GET_DASHBOARD_STATS_FAILED, payload: response.data.message });
        }
      } catch (error) {
        errorRequest(error, dispatch);
      }
    }
}
