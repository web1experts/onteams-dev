import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    CREATE_FIELD_SUCCESS,
    CUSTOM_FIELDS_LIST,
    FIELD_COMMON_ERROR,
    UPDATE_FIELD_SUCCESS
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
            type: FIELD_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: FIELD_COMMON_ERROR,
            payload: data.message,
    });
  }
}



export const createCustomField = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('custom_field', payload , config);
            if(response.data && response.data.success){
                await dispatch({ type: CREATE_FIELD_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: FIELD_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const fetchCustomFields = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiGet('custom_field', payload);
            if(response.data && response.data.success){
                await dispatch({ type: CUSTOM_FIELDS_LIST, payload:response.data});
            }else{
                await dispatch({ type: FIELD_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const updateCustomField = (id, payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPutUrl('custom_field', `/${id}`,payload);
            if(response.data && response.data.success){
                await dispatch({ type: UPDATE_FIELD_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: FIELD_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}
