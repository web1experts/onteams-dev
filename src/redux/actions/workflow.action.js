import { get } from 'lodash';
import API from '../../helpers/api';

import { 
   WORKFLOW_CREATE_SUCCESS,
   WORKFLOW_ERROR,
   WORKFLOW_GET_SUCCESS,
   WORKFLOW_SUCCESS,
   WORKFLOW_UPDATE_SUCESS,
   WORKFLOW_DELETE_SUCCESS
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
            type: WORKFLOW_ERROR,
            payload: data.error.message,
        });
    }else{
        dispatch({
            type: WORKFLOW_ERROR,
            payload: data.message,
    });
  }
}

export const ListWorkflows = (currentPage = 0, searchterm = "") => {
    return async (dispatch) => {
        try{
            const response = await API.apiGet('workflow', { search: searchterm, currentPage:currentPage });
            if(response.data && response.data.success){
            await dispatch({ type: WORKFLOW_GET_SUCCESS, payload: response.data })
            }else{
            await dispatch({ type: WORKFLOW_ERROR, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}
