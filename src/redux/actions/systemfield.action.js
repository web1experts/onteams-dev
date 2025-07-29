import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    SYSTEM_FIELDS_LIST,
    SYSTEM_FIELD_COMMON_ERROR,
    CLEAR_MESSAGES,
    SYSTEM_UPDATE_FIELD_SUCCESS
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
            type: SYSTEM_FIELD_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: SYSTEM_FIELD_COMMON_ERROR,
            payload: data.message,
    });
  }
}


export const fetchSystemFields = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiGet('system_field', payload);
            if(response.data && response.data.success){
                await dispatch({ type: SYSTEM_FIELDS_LIST, payload:response.data});
            }else{
                await dispatch({ type: SYSTEM_FIELD_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const updateSystemField = (id, payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPutUrl('system_field', `/update/${id}`,payload);
            if(response.data && response.data.success){
                await dispatch({ type: SYSTEM_UPDATE_FIELD_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: SYSTEM_FIELD_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}
