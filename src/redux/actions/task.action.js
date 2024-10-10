import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    CREATE_TASK_SUCCESS,
    CREATE_TASK_FAILED,
    LIST_TASK_SUCCESS,
    LIST_TASK_FAILED,
    PUT_TASK_SUCCESS,
    PUT_TASK_FAILED,
    DELETE_TASK_SUCCESS,
    DELETE_TASK_FAILED,
    GET_SINGLE_TASK_SUCCESS,
    GET_SINGLE_TASK_FAILED,
    TASK_COMMON_ERROR,
    TASK_REORDER_ERROR,
    TASK_REORDER
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
            type: TASK_COMMON_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: TASK_COMMON_ERROR,
            payload: data.message,
    });
  }
}

/**
 * @function ListProjects
 * @returns {Object}
 */
export const ListTasks = (projectId) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('task', {projectId: projectId});
            if(response.data && response.data.success){
            await dispatch({ type: LIST_TASK_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: LIST_TASK_FAILED, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createTask = (payload) =>{
    console.log('Payload: ', payload)
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('task', payload);
            if(response.data && response.data.success){
                await dispatch({ type: CREATE_TASK_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: CREATE_TASK_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}

export const reorderTasks  = (payload) => {
    
    return async (dispatch) => {
      try {
        const response = await API.apiPutUrl('task', `/reorder`, payload);
        if(response.data && response.data.success){
          await dispatch({ type: TASK_REORDER, payload: response.data});
        } else {
          await dispatch({ type: TASK_REORDER_ERROR, payload: response.data.message });
        }
      } catch (error) {
        errorRequest(error, dispatch);
      }
    }
  }

export const updateTask  = (task_id, payload) => {
    
    return async (dispatch) => {
      try {
        const response = await API.apiPutUrl('task', `/update/${task_id}`, payload);
        if(response.data && response.data.success){
          await dispatch({ type: PUT_TASK_SUCCESS, payload: response.data});
        } else {
          await dispatch({ type: PUT_TASK_FAILED, payload: response.data.message });
        }
      } catch (error) {
        errorRequest(error, dispatch);
      }
    }
  }

  export const deleteTask = (task_id) => {
    return async (dispatch)=>{
      try{
          const response = await API.apiDeleteUrl('task', `/${task_id}`);
          if(response.data && response.data.success){
              await dispatch({ type: DELETE_TASK_SUCCESS, payload:response.data});
          }else{
              await dispatch({ type: DELETE_TASK_FAILED, payload:response.data.message });
          }
      }catch (err){
          errorRequest(err, dispatch);
      }
  }
  }