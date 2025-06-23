import { get } from 'lodash';
import API from '../../helpers/api';

import { 
    POST_SUCCESS,
    POST_LIST_SUCCESS,
    POST_FAILED,
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
            type: POST_FAILED,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: POST_FAILED,
            payload: data.message,
    });
  }
}

/**
 * @function ListPosts
 * @returns {Object}
 */
export const ListPosts = (projectId) => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('post', {projectId: projectId});
            if(response.data && response.data.success){
            await dispatch({ type: POST_LIST_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: POST_FAILED, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createPost = (payload) =>{
    return async (dispatch)=>{
        try{
            const response = await API.apiPost('post', payload); console.log(response.data)
            if(response.data && response.data.success){
                await dispatch({ type: POST_SUCCESS, payload:response.data});
            }else{
                await dispatch({ type: POST_FAILED, payload:response.data.message });
            }
        }catch (err){
            errorRequest(err, dispatch);
        }
    }
}
