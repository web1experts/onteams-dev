import { 
    CREATE_MEMBER_SUCCESS,
    CREATE_MEMBER_FAILED,
    LIST_MEMBER_SUCCESS,
    LIST_MEMBER_FAILED,
    PUT_MEMBER_SUCCESS,
    PUT_MEMBER_FAILED,
    DELETE_MEMBER_SUCCESS,
    DELETE_MEMBER_FAILED,
    GET_SINGLE_MEMBER_SUCCESS,
    GET_SINGLE_MEMBER_FAILED,
    MEMBER_COMMON_ERROR,
    INVITE_ACCEPT_SUCCESS,
    INVITE_ACCEPT_FAILED,
    INVITE_LIST_SUCCESS,
    INVITE_LIST_FAILED,
    INVITE_DELETE_SUCCESS,
    INVITE_DELETE_FAILED,
    RESEND_INVITE_SUCCESS,
    RESEND_INVITE_FAILED,
    CLEAR_MESSAGES,
    MEMBERS_BY_ROLES
} from "../actions/types";

const initialState = {
    error: null,
    createMember: null,
    members: null,
    getOne: null,
    success: false,
    message: null,
    currentMember: {},
    message_variant: null,
};

export default (state = initialState, action) => {

  switch (action.type) {
    case CREATE_MEMBER_SUCCESS :
        return {
            ...state,
            createMember: action.payload.message,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            invite: true,
        };
    case CREATE_MEMBER_FAILED :
        return {
            ...state,
            message: action.payload,
            message_variant: 'danger',
            createMember: initialState.createMember,
            invite: false,
        }
    case LIST_MEMBER_SUCCESS:
        return {
            ...state,
            members: action.payload.membersData,
            createMember: initialState.createMember,
            invite: false,
        }
    case MEMBERS_BY_ROLES:
        
        return {
            ...state,
            memberslist: action.payload.memberdata,
        }
    case LIST_MEMBER_FAILED:
        return {
            ...state,
            message: action.payload,
            createMember: initialState.createMember,
            invite: false,
            message_variant: 'danger',
        }
    
    case DELETE_MEMBER_SUCCESS:
        return {
            ...state,
            deletedMember: action.payload.message,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            createMember: initialState.createMember,
            invite: false,
        }
    case DELETE_MEMBER_FAILED:
        return {
            ...state,
            message: action.payload,
            createMember: initialState.createMember,
            message_variant: 'danger',
            invite: false,
            success: true,
        }
    
    case INVITE_DELETE_SUCCESS:
        return {
            ...state,
            message: action.payload.message,
            message_variant: 'success',
            success: true,
            createMember: initialState.createMember,
            invite: true,
        }
    case INVITE_DELETE_FAILED:
        return {
            ...state,
            message: action.payload,
            createMember: initialState.createMember,
            message_variant: 'danger',
            invite: true,
        }
    
    case INVITE_ACCEPT_FAILED:
        return {
            message: action.payload,
            message_variant: 'danger',
            createMember: initialState.createMember,
            invite: false,
        }
    case INVITE_ACCEPT_SUCCESS:
        return {
            ...state,
            invite: true,
            message: action.payload.message,
            message_variant: 'success',
            companies: action.payload.companies,
            createMember: initialState.createMember,
        }
    case RESEND_INVITE_FAILED:
        return {
            ...state,
            invite: false,
            message: action.payload,
            message_variant: 'danger',
            createMember: initialState.createMember,
        }
    case RESEND_INVITE_SUCCESS:
        return {
            ...state,
            invite: false,
            message: action.payload,
            createMember: initialState.createMember,
            message_variant: 'success',
        }
    case INVITE_LIST_FAILED:
        return {
            ...state,
            message: action.payload,
            message_variant: 'danger',
            invite: false,
            createMember: initialState.createMember,
        }
    case INVITE_LIST_SUCCESS:
        return {
            ...state,
            invitations: action.payload.inviteData,
            createMember: initialState.createMember,
            invite: false,
        }
    case PUT_MEMBER_SUCCESS:
        return {
            ...state,
            updatedMember: action.payload.updatedMember,
            message: action.payload.message,
            success: true,
            message_variant: 'success',
            createMember: initialState.createMember,
            invite: false,
        }
    case PUT_MEMBER_FAILED:
        return{
            ...state,
            message: action.payload,
            message_variant: 'danger',
            createMember: initialState.createMember,
            invite: false,
        }
    
    case MEMBER_COMMON_ERROR: 
        return {
            ...state,
            message: action.payload, 
            error: true,
            createMember: initialState.createMember,
            success: false,
            invite: false,
        }
    case  GET_SINGLE_MEMBER_SUCCESS  :
        return {
            //...state,
            currentMember: action.payload.memberdata,
            //createMember: initialState.createMember,
            // success: false,
            // error: false,
            // invite: false,
        }
    case GET_SINGLE_MEMBER_FAILED : 
        return {
            ...state,
            currentMember: {},
            createMember: {},
            success: false,
            error: false,
            invite: false,
        }
    case CLEAR_MESSAGES :
        return {
            // ...state,
            createMember: initialState.createMember,
            message: null,
            message_variant: null,
            invite: false,
        }
    default: return state;
  }
};
