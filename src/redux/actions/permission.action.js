import { get } from 'lodash';
import API from '../../helpers/api';
import { Navigate } from 'react-router-dom';
import * as auth from '../../helpers/auth';
import {
  LOGIN_COMMON_ERROR,
  GET_PERMISSIONS_SUCCESS,
  GET_PERMISSIONS_FAILED
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
    dispatch({
      type: LOGIN_COMMON_ERROR,
      payload: data.error.message,
    });
  } else {
    dispatch({
      type: LOGIN_COMMON_ERROR,
      payload: data.message,
    });
  }
}


