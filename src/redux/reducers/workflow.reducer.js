import { 
    WORKFLOW_CREATE_SUCCESS,
    WORKFLOW_ERROR,
    WORKFLOW_GET_SUCCESS,
    WORKFLOW_SUCCESS,
    WORKFLOW_UPDATE_SUCESS,
    WORKFLOW_DELETE_SUCCESS,
    CLEAR_MESSAGES
} from "../actions/types";

const initialState = {
    error: null,
    workflows: [],
    success: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WORKFLOW_CREATE_SUCCESS :
        return {
            ...state,
            success: action.payload.message,
            workflows: action.payload.workflows
        };
    case WORKFLOW_ERROR :
        return {
            ...state,
            error: action.payload.message ? action.payload.message : action.payload,
        }
    case WORKFLOW_GET_SUCCESS:
        return {
            workflows: action.payload.workflows
        }
    case WORKFLOW_SUCCESS:
        return {
            success: action.payload.message,
        }
    
    case WORKFLOW_UPDATE_SUCESS:
        return {
            success: action.payload.message,
            workflows: action.payload.workflows
        }
    case WORKFLOW_DELETE_SUCCESS:
        return {
            success: action.payload.message,
            workflows: action.payload.workflows
        }
    
    case CLEAR_MESSAGES:
        return {
            // ...state,
            message_variant: 'success',
            message: null,
            error: null
        };
    default: return state;
  }
};
