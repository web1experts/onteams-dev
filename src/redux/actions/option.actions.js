import { get } from 'lodash';
import API from '../../helpers/api';
import {
    LOGIN_COMMON_ERROR,
    OPTIONS_ERROR,
    OPTION_SUCCESS,
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
  if (data.error) {
    console.log('Error one')
    dispatch({
      type: OPTIONS_ERROR,
      payload: data.error.message,
    });
  } else {
    console.log('Error two', err)
    dispatch({
      type: OPTIONS_ERROR,
      payload: data.message,
    });
  }
}

  export const getOption = ( key ) => {
    return async (dispatch) => {
      try {
        const response = await API.apiGet('options', `/${key}`)
  
        if (response.data && response.data.success) {
          await dispatch({ type: OPTION_SUCCESS, payload: response.data });
        }
      } catch (err) {
        errorRequest(err, dispatch);
      }
    };
  }

