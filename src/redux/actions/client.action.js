import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    CREATE_CLIENT_SUCCESS,
    CREATE_CLIENT_FAILED,
    LIST_CLIENT_SUCCESS,
    LIST_CLIENT_FAILED,
    PUT_CLIENT_SUCCESS,
    PUT_CLIENT_FAILED,
    DELETE_CLIENT_SUCCESS,
    DELETE_CLIENT_FAILED,
    GET_SINGLE_CLIENT_SUCCESS,
    GET_SINGLE_CLIENT_FAILED,
    CLIENT_COMMON_ERROR,
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
            type: CLIENT_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: CLIENT_COMMON_ERROR,
            payload: data.message,
    });
  }
}

/**
 * @function ListClients
 * @returns {Object}
 */
export const ListClients = (currentPage = 0, searchterm = "") => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('client', { search: searchterm, currentPage:currentPage });
            if(response.data && response.data.success){
            await dispatch({ type: LIST_CLIENT_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: LIST_CLIENT_FAILED, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createClient = (payload) =>{
    console.log('Payload: ', payload)
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('client', payload , config);
            if(response.data && response.data.success){
                await dispatch({ type: CREATE_CLIENT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: CREATE_CLIENT_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const deleteClient = (clientId) =>{
   
    return async (dispatch)=>{
        try{
            const response = await API.apiDeleteUrl('client', `/${clientId}`);
            if(response.data && response.data.success){
                await dispatch({ type: DELETE_CLIENT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: DELETE_CLIENT_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const updateClient = (clientId, payload) =>{
   
    return async (dispatch)=>{
        try{
            const response = await API.apiPutUrl('client', `/update/${clientId}`, payload);
            if(response.data && response.data.success){
                await dispatch({ type: PUT_CLIENT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: PUT_CLIENT_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}