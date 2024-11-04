import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    CREATE_PROJECT_SUCCESS,
    CREATE_PROJECT_FAILED,
    LIST_PROJECT_SUCCESS,
    LIST_PROJECT_FAILED,
    PUT_PROJECT_SUCCESS,
    PUT_PROJECT_FAILED,
    DELETE_PROJECT_SUCCESS,
    DELETE_PROJECT_FAILED,
    GET_SINGLE_PROJECT_SUCCESS,
    GET_SINGLE_PROJECT_FAILED,
    PROJECT_COMMON_ERROR,
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
            type: PROJECT_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: PROJECT_COMMON_ERROR,
            payload: data.message,
    });
  }
}

/**
 * @function ListProjects
 * @returns {Object}
 */
export const ListProjects = (payload) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('project', payload);
            if(response.data && response.data.success){
            await dispatch({ type: LIST_PROJECT_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: LIST_PROJECT_FAILED, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createProject = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('project', payload);
            if(response.data && response.data.success){
                await dispatch({ type: CREATE_PROJECT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: CREATE_PROJECT_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const updateProject  = (projectid, payload) => {
    
    return async (dispatch) => {
      try {
        const response = await API.apiPutUrl('project', `/update/${projectid}`, payload);
        if(response.data && response.data.success){
          await dispatch({ type: PUT_PROJECT_SUCCESS, payload: response.data});
        } else {
          await dispatch({ type: PUT_PROJECT_FAILED, payload: response.data.message });
        }
      } catch (error) {
        errorRequest(error, dispatch);
      }
    }
  }

export const deleteProject = (projectId) =>{
    
    return async (dispatch)=>{
        try{
            const response = await API.apiDeleteUrl('project', `/${projectId}`);
            if(response.data && response.data.success){
                await dispatch({ type: DELETE_PROJECT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: DELETE_PROJECT_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const getSingleProject = (projectId) =>{
    
    return async (dispatch)=>{
        try{
            const response = await API.apiGet('project', `/${projectId}`);
            if(response.data && response.data.success){
                await dispatch({ type: GET_SINGLE_PROJECT_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: PROJECT_COMMON_ERROR, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const reorderedProject = (payload) => {
    return async (dispatch)=>{
        try{
            const response = await API.apiPutUrl('project', `/reorder`, payload);
            if(response.data && response.data.success){
                console.log('Reorder Successfull')
            }else{
                console.log('Reorder failed')
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}