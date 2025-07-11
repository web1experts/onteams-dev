import { 
    CREATE_TASK_SUCCESS,
    CREATE_TASK_FAILED,
    LIST_TASK_SUCCESS,
    LIST_TASK_FAILED,
    PUT_TASK_SUCCESS,
    PUT_TASK_FAILED,
    DELETE_TASK_SUCCESS,
    DELETE_TASK_FAILED,
    GET_SINGLE_TASK_SUCCESS,
    GET_SINGLE_TASK_FAILED,
    TASK_COMMON_ERROR,
    CLEAR_MESSAGES,
    CREATE_POST_LIST_COMMENT,
    CURRENT_TASK,
    DELETE_COMMENT,
    TASK_REORDER_ERROR,
    TASK_REORDER

} from "../actions/types";
    
    const initialState = {
        error: null,
        createTask: null,
        task: null,
        getTaskFeed: null,
        comment: null,
        singleTask: null,
        message_variant: null,
        tasks: null,
        reorder: null
    };
    
    export default (state = initialState, action) => {
      switch (action.type) {
        case CREATE_TASK_SUCCESS :
            return {
                ...state,
                 success: false,
                 successfull: false,
                 UpdatedTask: null,
                error: null,
                // message_variant: 'success',
                newTask: action.payload.task
            };
        case CREATE_TASK_FAILED :
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case LIST_TASK_SUCCESS:
            return {
                tasks: action.payload.tasksData
            }
        case LIST_TASK_FAILED:
            return {
                error: action.payload,
            }
        case DELETE_TASK_SUCCESS:
            return {
                success: true,
                message: action.payload.message,
                message_variant: 'success',
            }
        case DELETE_TASK_FAILED:
            return {
                message: action.payload,
                message_variant: 'danger',
            }
        
        case GET_SINGLE_TASK_SUCCESS:
            return {
                singleTask: action.payload.taskData,
            }
        case GET_SINGLE_TASK_FAILED:
            return {
                error: action.payload
            }
        
        case PUT_TASK_SUCCESS:
            return {
                UpdatedTask: action.payload.updatedTask,
                success: action.payload.refresh,
                // message: action.payload.message,
                // message_variant: 'success',
            }
        case PUT_TASK_FAILED:
            return{
                message: action.payload,
                message_variant: 'danger',
            }
        case TASK_REORDER:
            return {
                successfull: true,
                UpdatedTask: action.payload.UpdatedTask,
                reorder: 'pass'
            }
        case TASK_REORDER_ERROR:
            return{
                successfull: false,
                reorder: 'fail'
            }
        case TASK_COMMON_ERROR: 
            return {
                message: action.payload,
                message_variant: 'danger',
            }
        case CLEAR_MESSAGES:
            return {
                ...state,
                message: null,
                message_variant: null,
                UpdatedTask: null,
                newTask: null
            };
        case CURRENT_TASK: 
            return {
                ...state,
                currentTask: action.payload
            }
            case CREATE_POST_LIST_COMMENT: {
                if(action.payload.type !== 'task'){return {...state}}
                return {
                    ...state,
                    UpdatedTask: action.payload.updatedTask
                }
                
            }
            
            
            
        
        case DELETE_COMMENT: {
           if(action.payload.type !== 'task'){return {...state}}
            return {
                ...state,
                UpdatedTask: action.payload.updatedTask
            }
        }
        
        default: return state;
      }
    };
    