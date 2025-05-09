import { get } from 'lodash';
import API from '../../helpers/api';
import { refreshUserWorkspace } from './auth.actions';

import {
    CREATE_MEMBER_SUCCESS,
    CREATE_MEMBER_FAILED,
    LIST_MEMBER_SUCCESS,
    LIST_MEMBER_FAILED,
    PUT_MEMBER_SUCCESS,
    PUT_MEMBER_FAILED,
    DELETE_MEMBER_SUCCESS,
    DELETE_MEMBER_FAILED,
    MEMBER_COMMON_ERROR,
    INVITE_ACCEPT_SUCCESS,
    INVITE_ACCEPT_FAILED,
    INVITE_LIST_SUCCESS,
    INVITE_LIST_FAILED,
    INVITE_DELETE_SUCCESS,
    INVITE_DELETE_FAILED,
    RESEND_INVITE_SUCCESS,
    RESEND_INVITE_FAILED,
    GET_SINGLE_MEMBER_SUCCESS,
    GET_SINGLE_MEMBER_FAILED,
    MEMBERS_BY_ROLES
} from "./types";

const config = {
    headers: {
        'Content-Type': "application/json; charset=utf-8"
    }
}

function errorRequest(err, dispatch) {
    console.log('I am here now')
    let data = get(err, 'response.data', null);
    data = data || get(err, 'response');
    data = data || err;
    if (data.error) {
        dispatch({
            type: MEMBER_COMMON_ERROR,
            payload: data.error.message,
        });
    } else {
        dispatch({
            type: MEMBER_COMMON_ERROR,
            payload: data.message,
        });
    }
}

/**
 * @function ListMEMBERs
 * @returns {Object}
 */
export const Listmembers = (currentPage, searchterm, has_limit = true) => {
    return async (dispatch) => {
        try {
            const response = await API.apiGet('member', { search: searchterm, currentPage: currentPage, has_limit: has_limit });
            if (response.data && response.data.success) {
                await dispatch({ type: LIST_MEMBER_SUCCESS, payload: response.data })
            } else {
                await dispatch({ type: LIST_MEMBER_FAILED, payload: response.data.message });
            }
        } catch (error) {
            errorRequest(error, dispatch);
        }
    }
}


export const createMember = (payload) => {
    return async (dispatch) => {
        try {
            const response = await API.apiPost('member', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            if (response.data && response.data.success) {
                await dispatch({ type: CREATE_MEMBER_SUCCESS, payload: response.data });
            } else {
                await dispatch({ type: CREATE_MEMBER_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const deleteMember = (memberId) => {

    return async (dispatch) => {
        try {
            const response = await API.apiDeleteUrl('member', `/${memberId}`);
            if (response.data && response.data.success) {
                await dispatch({ type: DELETE_MEMBER_SUCCESS, payload: response.data });
                
            } else {
                await dispatch({ type: DELETE_MEMBER_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const updateMember = (memberId, payload) => {

    return async (dispatch) => {
        try {
            const response = await API.apiPutUrl('member', `/update/${memberId}`, payload);
            if (response.data && response.data.success) {
                await dispatch({ type: PUT_MEMBER_SUCCESS, payload: response.data });
            } else {
                await dispatch({ type: PUT_MEMBER_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}



export const acceptCompanyinvite = (payload) => {
    return async (dispatch) => {
        try {
            const response = await API.apiPostUrl('invites', '/accept',payload)
            if (response.data.success === true) {
                await dispatch({ type: INVITE_ACCEPT_SUCCESS, payload: response.data });
                dispatch(refreshUserWorkspace())
                // await dispatch(getSingleMemberByUserAndCompanyId())
            } else {
                await dispatch({ type: INVITE_ACCEPT_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    };
}

export const listCompanyinvite = (currentPage, listfor = 'member', search) => { 
    return async (dispatch) => {
        try {
            const response = await API.apiGet('invites', {currentPage: currentPage, listfor: listfor, search: search}, config)
            if (response.data.success === true) {
                await dispatch({ type: INVITE_LIST_SUCCESS, payload: response.data });
            } else {
                await dispatch({ type: INVITE_LIST_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    };
}

export const deleteInvite = (inviteId) => {

    return async (dispatch) => {
        try {
            const response = await API.apiDeleteUrl('invites', `/${inviteId}`);
            if (response.data && response.data.success) {
                await dispatch({ type: INVITE_DELETE_SUCCESS, payload: response.data });
            } else {
                await dispatch({ type: INVITE_DELETE_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const resendInvite = (payload) => {

    return async (dispatch) => {
        try {
            const response = await API.apiPostUrl('invites', `/resend`, payload);
            if (response.data && response.data.success) {
                await dispatch({ type: RESEND_INVITE_SUCCESS, payload: response.data.message });
            } else {
                await dispatch({ type: RESEND_INVITE_FAILED, payload: response.data.message });
            }
        } catch (err) {
            errorRequest(err, dispatch);
        }
    }
}

export const getSingleMemberByUserAndCompanyId = () => { 
    return async (dispatch) => {
      try {
        const response = await API.apiGet('company_member_data',)
  
        if (response.data && response.data.success) {
          await dispatch({ type: GET_SINGLE_MEMBER_SUCCESS, payload: response.data });
        } 
        else {
            console.log('Failed request')
          await dispatch({ type: GET_SINGLE_MEMBER_FAILED, payload: response.data.message });
        }
      } catch (err) {
        errorRequest(err, dispatch);
      }
    };
}

export const getMembersGroupByRoles = () => {
    return async (dispatch) => {
        try {
          const response = await API.apiGet('member','/members-by-roles')
    
          if (response.data && response.data.success) {
            await dispatch({ type: MEMBERS_BY_ROLES, payload: response.data });
          } 
          else {
              console.log('Failed request')
            await dispatch({ type: LIST_MEMBER_FAILED, payload: response.data.message });
          }
        } catch (err) {
          errorRequest(err, dispatch);
        }
    };
}