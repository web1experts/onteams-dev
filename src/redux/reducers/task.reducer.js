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

} from "../actions/types";
    
    const initialState = {
        error: null,
        createTask: null,
        task: null,
        getTaskFeed: null,
        comment: null,
        singleTask: null,
    };
    
    export default (state = initialState, action) => {
      switch (action.type) {
        case CREATE_TASK_SUCCESS :
            return {
                ...state,
                createTask: action.payload.message,
                error: null
            };
        case CREATE_TASK_FAILED :
            return {
                ...state,
                error: action.payload.message,
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
                deletedTask: action.payload.message,
            }
        case DELETE_TASK_FAILED:
            return {
                error: action.payload
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
                updatedTask: action.payload.message
            }
        case PUT_TASK_FAILED:
            return{
                error: action.payload
            }
        case TASK_COMMON_ERROR: 
            return {
                error: action.payload, 
            }
        default: return state;
      }
    };
    