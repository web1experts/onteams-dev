import axios from './instance';
import * as auth from '../auth';
import apiKeys from './apiKeys';
import CryptoJS from 'crypto-js';
import { parseIfValidJSON } from '../commonfunctions';
import { getUserProfile } from '../../redux/actions/auth.actions';

const secretKey = process.env.REACT_APP_SECRET_KEY

const getUrlByKey = (key) => {
  return apiKeys[key];
};

const APP_NAME = process.env.REACT_APP_APP_NAME;

class API {
  // eslint-disable-next-line lines-around-comment
  /**
   * auth2 login api
   * @param {string} url String
   * @param {object} payload Object
   * @param {object} action Object e.g {type: 'AUTH', dispatch: function(){} }
   * @returns {Promise<void>} void
   */

  static apiGet = async (key, args) => {
    if (typeof args === 'string') {
      return await axios.get(getUrlByKey(key) + args, {
        withCredentials: false,
      });
    }
    return await axios.get(getUrlByKey(key), {
      params: args,
      withCredentials: false,
    });
  };

  static apiGetByKey = async (key, args, query) => {
    if (typeof args === 'string') {
      return axios.get(getUrlByKey(key) + args, {
        params: query,
        withCredentials: false,
      });
    }
    return axios.get(`${getUrlByKey(key)}?${query}`, {
      data: args,
      withCredentials: false,
    });
  };

  static apiPost = async (key, args, headers = '') => {
    return await axios.post(getUrlByKey(key), args, headers);
  };

  static apiPostUrl = async (key, dynamicUrl, args) => {
    return axios.post(getUrlByKey(key) + dynamicUrl, args);
  };

  static apiPut = async (key, args) => {
    if (typeof args === 'string') {
      return axios.put(getUrlByKey(key) + args, {
        withCredentials: false,
      });
    }
    return axios.put(getUrlByKey(key), args, {
      withCredentials: false,
    });
  };

  static apiPutUrl = async (key, dynamicUrl, args) => {
    return axios.put(getUrlByKey(key) + dynamicUrl, args);
  };

  static apiPatch = async (key, args) => {
    if (typeof args === 'string') {
      return await axios.patch(getUrlByKey(key) + args, {
        withCredentials: false,
      });
    }
    return await axios.put(getUrlByKey(key), args, {
      withCredentials: false,
    });
  };

  static apiPatchUrl = async (key, dynamicUrl, args) => {
    return await axios.patch(getUrlByKey(key) + dynamicUrl, args);
  };

  static apiUploadFile = async (key, args, configs) => {
    return await axios.post(getUrlByKey(key), args, configs);
  };

  static apiUpdateUploadFile = async (key,dynamicUrl, args, configs) => {
    return await axios.put(getUrlByKey(key) + dynamicUrl, args, configs);
  };

  static apiUpdateFile = async (key, dynamicUrl, args, configs) => {
    return axios.put(getUrlByKey(key) + dynamicUrl, args, configs);
  };

  static apiDelete = async (key, args) => {
    return axios.delete(getUrlByKey(key), args);
  };

  static apiDeleteUrl = async (key, dynamicUrl, args) => {
    return axios.delete(getUrlByKey(key) + dynamicUrl, { data: args });
  };

  static apiDeletePost = async (key, args) => {
    return axios.delete(getUrlByKey(key), { data: args });
  };

  static setCSRF = (csrfToken, sessionid) => {
    const CSRF_COOKIE = sessionid;
    localStorage.setItem('web_token', CSRF_COOKIE);
    axios.defaults.headers.common['X-CSRFToken'] = CSRF_COOKIE;
  };
}

export default API;

// # interceptors
axios.interceptors.request.use(
  (configs) => {
    // const loading = true;
    return configs;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // const loading = false;
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401 && window.location.pathname !== '/signin') {
      // eslint-disable-next-line no-console
      auth.logout();
    }
    return Promise.reject(error);
  }
);

export const setAuthorization = () => { 
    const encryptedCompany = localStorage.getItem('current_dashboard');
    if(encryptedCompany && encryptedCompany !== ""){
      const decryptedCompany = JSON.parse(encryptedCompany);
      axios.defaults.headers.common.companyId =  decryptedCompany?.id || '' 
    }

    const mt_featureSwitches = localStorage.getItem('mt_featureSwitches');
    if(mt_featureSwitches && mt_featureSwitches !== "" && mt_featureSwitches !== null ){
      const memberData = parseIfValidJSON(mt_featureSwitches)
      if( memberData !== false) {
        axios.defaults.headers.common.memberkey =  memberData._id || ''
      }
      
    }
    

  // to consider major cookies security
  axios.defaults.withCredentials = false;
  axios.defaults.headers.common.authorization = localStorage.getItem('accessToken') ? 'Bearer ' + localStorage.getItem('accessToken') : '';
  
  // axios.defaults.headers.common[`${APP_NAME}-VERSION`] = '1.0.0';
  // axios.defaults.headers.common.version = 'v1'; // API VERSION
};

export const getUserDetails = async () => {
  try {
    const response = await API.apiGet('profile'); // Ensure the API endpoint is correct
    
    if (response.data && response.data.success) {
      const profileData = response.data.profileData;

      // Check if 'current_loggedin_user' exists in localStorage
      const currentLoggedInUser = localStorage.getItem('current_loggedin_user');
      if (currentLoggedInUser) {
        const jsonData = parseIfValidJSON(currentLoggedInUser);

        if (jsonData) {
          jsonData['name'] = profileData?.name || jsonData['name'];
          jsonData['avatar'] = profileData?.avatar || jsonData['avatar'];
          
          // Update localStorage with new data
          localStorage.setItem('current_loggedin_user', JSON.stringify(jsonData));
        }
      }
    } else {
      console.error('Error in response data:', response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching user details:', error.message || 'Unknown error');
  }
};
setAuthorization();
setTimeout(function(){
  getUserDetails();
},500)


