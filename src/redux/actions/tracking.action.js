import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    TIME_TRACKING_STATUS,
    TRACKING_COMMON_ERROR,
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
            type: TRACKING_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: TRACKING_COMMON_ERROR,
            payload: data.message,
    });
  }
}

export const trackstatus = ( payload ) =>{
    return async (dispatch)=>{
        try{
            await dispatch({ type: TIME_TRACKING_STATUS, payload: payload });
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}