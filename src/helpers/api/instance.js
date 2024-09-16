import axios from 'axios';
import { showLoader, hideLoader } from '../../redux/actions/loaderActions';
//import { showSnackbar } from '../../Components/snackbar/snackbarprovider';
import store from '../../redux/store';

const HOST = process.env.REACT_APP_API_HOST;
const VERSION = process.env.REACT_APP_API_VERSION;
const API = HOST + VERSION;

const instance = axios.create({
  baseURL: API,
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    store.dispatch(showLoader());
    return config;
  },
  (error) => {
    store.dispatch(hideLoader());
    //showSnackbar('An unexpected error occurred during the request.', 'error');
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    store.dispatch(hideLoader());
    if (response.data && response.data.message && response.data.success === true ) {
      //showSnackbar(response.data.message, 'success');
    }else if (response.data && response.data.message && response.data.success === false ) {
      //showSnackbar(response.data.message, 'error');
    }
    return response;
  },
  (error) => {
    store.dispatch(hideLoader());
    if (error.response && error.response.data && error.response.data.message) {
      //showSnackbar(error.response.data.message, 'error');
    } else {
      //showSnackbar('An unexpected error occurred during the response.', 'error');
    }
    return Promise.reject(error);
  }
);

export default instance;
