import { 
    CREATE_PROJECT_SUCCESS,
    CREATE_PROJECT_FAILED,
    LIST_PROJECT_SUCCESS,
    LIST_PROJECT_FAILED,
    PUT_PROJECT_SUCCESS,
    PUT_PROJECT_FAILED,
    DELETE_PROJECT_SUCCESS,
    DELETE_PROJECT_FAILED,
    GET_SINGLE_PROJECT_SUCCESS,
    GET_SINGLE_PROJECT_FAILED,
    PROJECT_COMMON_ERROR,
    CLEAR_MESSAGES,
    PROJECT_REORDER,
    MEMBER_PROJECTS

} from "../actions/types";
    
    const initialState = {
        error: null,
        createProject: null,
        projects: null,
        getProjectFeed: null,
        comment: null,
        singleProject: null,
        success:null,
        message: null,
        message_variant: null,
    };
    
    export default (state = initialState, action) => {
      switch (action.type) {
        case CREATE_PROJECT_SUCCESS :
            return {
                ...state,
                createProject: action.payload.message,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            };
        case CREATE_PROJECT_FAILED :
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case LIST_PROJECT_SUCCESS:
            return {
                projects: action.payload.projectsData
            }
        case MEMBER_PROJECTS: 
            return {
                memberProjects: action.payload.projectsData
            }
        case LIST_PROJECT_FAILED:
            return {
                message: action.payload,
                message_variant: 'danger',
                //error: action.payload,
            }
        case DELETE_PROJECT_SUCCESS:
            return {
                deletedProject: action.payload.message,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
            }
        case DELETE_PROJECT_FAILED:
            return {
                //error: action.payload,
                message: action.payload,
                message_variant: 'danger',
            }
        
        case GET_SINGLE_PROJECT_SUCCESS:
            return {
                singleProject: action.payload.projectData,
            }
        case GET_SINGLE_PROJECT_FAILED:
            return {
                error: action.payload
            }
        
        case PUT_PROJECT_SUCCESS:
            return {
                updatedProject: action.payload.updatedProject,
                success: action.payload.success,
                message: action.payload.message,
                message_variant: 'success',
            }
        case PUT_PROJECT_FAILED:
            return{
                message: action.payload,
                message_variant: 'danger',
            }
        case PROJECT_COMMON_ERROR: 
            return {
                message: action.payload,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES :
            return {
                ...state,
                createProject: initialState.createProject,
                updatedProject: '',
                success: '',
                error: '',
                singleProject: '',
                message: null,
                message_variant: null,
            }
        case PROJECT_REORDER:
            return {
                successfull: true
            }
        default: return state;
      }
    };
    