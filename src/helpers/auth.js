import CryptoJS from 'crypto-js';
import { setAuthorization } from './api';
import io from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';
import axios from './api/instance'
import { parseIfValidJSON, mergePermissions } from './commonfunctions';
const secretKey = process.env.REACT_APP_SECRET_KEY
let socket;

// Function to initialize or refresh the socket connection
const initializeSocket = () => {
  if (socket) {
    socket.disconnect(); // Disconnect the existing connection
  }

  socket = io(process.env.REACT_APP_API_HOST, {
    transports: ['websocket'], maxHttpBufferSize: 1e8 });
};

// Initialize the socket connection
initializeSocket();

// Function to refresh the socket connection
export const refreshSocket = () => {
  initializeSocket();
};

// Export the socket instance
export { socket };

export function encryptJsonData(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

export function decryptJsonData(data, key) { 
  const bytes = CryptoJS.AES.decrypt(data, key); 
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// export const socket = io(process.env.REACT_APP_API_HOST, {
//   transports: ['polling'], maxHttpBufferSize: 1e8 });

// console.log('process.env.REACT_APP_API_HOST',process.env.REACT_APP_API_HOST)

export function getLanguage() {
  return localStorage.getItem('appLang');
}

export function setLanguage(lang) {
  return localStorage.setItem('appLang', lang);
}

export function getAppId() {
  return process.env.REACT_APP_SECRET_KEY || 'INVALID';
}

export function getToken() {
  return localStorage.getItem('accessToken');
}

export function encodeJWT(payload, KEY = getAppId()) {
  try {
    const encodedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), KEY).toString();
    const encodedPayloadString = encodedPayload.replace(/\+/g, '~').replace(/\//g, '!').replace(/=/g, '_');
    return encodedPayloadString;
  } catch (error) {
    error.message = 'Data encryption failed';
    return false;
  }
}

export function decodeJWT(initialToken, KEY = getAppId()) {
  try {

    const decodedToken = jwtDecode(initialToken);
    return decodedToken;
    const token = initialToken.replace(/~/g, '+').replace(/!/g, '/').replace(/_/g, '=');
    const bytes = CryptoJS.AES.decrypt(token, KEY);
    const playload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return playload;
  } catch (error) {
    error.message = 'Invalid secret key';
    return false;
  }
}

export function makeWebId(length) {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join('');
}

export function currentUser() {
  return JSON.parse(localStorage.getItem('accessToken'));
}

export function isAuth() {
  try {
    const tokenChecked = localStorage.getItem('accessToken');
    if (tokenChecked) {
      return decodeJWT(tokenChecked);
    }
    return false;
  } catch (err) {
    return false;
  }
}

export async function login(token,  current_loggedin_user = false, companies = []) {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('current_loggedin_user', JSON.stringify(current_loggedin_user, secretKey));
  setupDashboards( companies)
  setAuthorization();
  return true;
}

export function setupDashboards( companies ){
  if( companies.length > 0){ 
    localStorage.setItem('mt_dashboards', JSON.stringify(companies));
    const current_dashboard = localStorage.getItem('current_dashboard');
    
    if (current_dashboard) {
      const parsedata = JSON.parse(current_dashboard)
      
      // const companyExists = companies.some(company => company._id === current_dashboard.id);
      let companyExists = false
      for( let i = 0; i < companies.length; i++){
        if(companies[i].company._id === parsedata.id){
          companyExists = companies[i];
        }
      }

      if (!companyExists) { 
        localStorage.setItem('current_dashboard', JSON.stringify({ name: companies[0].company.name, id: companies[0].company._id }));
        axios.defaults.headers.common.companyId =  companies[0].company._id || ''
        localStorage.setItem('mt_featureSwitches', JSON.stringify(companies[0]?.memberData || null))
        axios.defaults.headers.common.memberkey =  companies[0]?.memberData?._id || ''
      }else{
        localStorage.setItem('current_dashboard', JSON.stringify({ name: companyExists.company.name, id: companyExists.company._id }));
        localStorage.setItem('mt_featureSwitches', JSON.stringify(companyExists?.memberData || null))
        axios.defaults.headers.common.memberkey =  companyExists?.memberData?._id || ''
      }
    }else{
      localStorage.setItem('current_dashboard', JSON.stringify({name: companies[0].company.name, id: companies[0].company._id}));
      axios.defaults.headers.common.companyId =  companies[0].company._id || ''
      localStorage.setItem('mt_featureSwitches', JSON.stringify(companies[0]?.memberData || null))
      axios.defaults.headers.common.memberkey =  companies[0]?.memberData?._id || ''
    } 
  }else{ 
    localStorage.removeItem('current_dashboard');
    localStorage.removeItem('mt_dashboards');
    localStorage.removeItem('mt_featureSwitches');
  }
}

export function getloggedInUser(){
  try {
    const current_loggedin_user = parseIfValidJSON(localStorage.getItem('current_loggedin_user'));
    
    if (current_loggedin_user) {
      return current_loggedin_user;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export function currentMemberProfile(){
  try {
    const current_memberProfile = parseIfValidJSON(localStorage.getItem('mt_featureSwitches'));
    
    if (current_memberProfile) {
      // let permissions = mergePermissions(current_memberProfile?.role?.permissions, current_memberProfile?.permissions)
      // current_memberProfile.permissions = permissions
      return current_memberProfile;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export function setRemember(user = {}) {
  localStorage.setItem('userRemember', JSON.stringify(user || isAuth()));
  return true;
}

export function removeRemember() {
  localStorage.removeItem('userRemember');
  return true;
}

export function saveTheme(theme){
  localStorage.setItem('theme', JSON.stringify(theme));
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('appId');
  localStorage.removeItem('current_dashboard');
  localStorage.removeItem('mt_dashboards');
  localStorage.removeItem('mt_featureSwitches');
  localStorage.removeItem('current_loggedin_user');
  setAuthorization();
  setTimeout(() => {
    window.location.href = `${window.location.origin}/login`;
  }, 500);
  return true;
}

export const SendComment = (text, postId, userId,parentCommentId) => {
  socket.emit('comment', { text, postId, userId,parentCommentId });
};

export const createTask = (payload) => { 
  socket.emit('addtask', payload);
}

export const UpdateComment = (postId, text ) => {
  // console.log('text, postId, userId',text, postId, userId,parentCommentId)
  socket.emit('update_comment', { text, postId });
};

export const SendReplyComment = (text, postId, userId, parentCommentId) => {
  // console.log('text, postId, userId',text, postId, userId,parentCommentId)
  socket.emit('new_reply', { text, postId, userId,parentCommentId });
};

export const DeleteComment = (commentId,feedId) => {
  // console.log('commentId',commentId)
  socket.emit('delete_comment', { commentId,feedId });
};

export const DeleteNestedComment = (commentId) => {
  socket.emit('delete_nested_comment', { commentId });
};

export const LikeComment = (user, postId) => {
  socket.emit('LikePost', { user, postId });
};

export const DisLikeComment = (user, postId) => {
  socket.emit('disLikePost', { user, postId });
};

