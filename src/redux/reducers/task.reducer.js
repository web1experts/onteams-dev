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
    DELETE_COMMENT

} from "../actions/types";
    
    const initialState = {
        error: null,
        createTask: null,
        task: null,
        getTaskFeed: null,
        comment: null,
        singleTask: null,
        message_variant: null,
        tasks: null
    };
    
    export default (state = initialState, action) => {
      switch (action.type) {
        case CREATE_TASK_SUCCESS :
            return {
                ...state,
                success: true,
                message: action.payload.message,
                error: null,
                message_variant: 'success',
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
                currentTask: action.payload.updatedTask,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
            }
        case PUT_TASK_FAILED:
            return{
                message: action.payload,
                message_variant: 'danger',
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
            };
        case CURRENT_TASK: 
            return {
                ...state,
                currentTask: action.payload
            }
        case CREATE_POST_LIST_COMMENT: {
            const tabId = action.payload.comment?.task?.tab; // Get the tab ID from the comment's associated task
            const taskId = action.payload.comment?.task?._id; // Get the task ID from the comment
        
            // Check if the state has tasks under the correct tab
            if (!state.tasks?.taskData[tabId]) {
                console.log('Tab not found in the state');
                return state; // Return the unchanged state if the tab doesn't exist
            }
        
            // Find the task in the corresponding tab and update its comments
            const updatedTasks = (state.tasks.taskData[tabId]?.tasks || []).map((task) => {
                if (task._id.toString() === taskId.toString()) { // Compare as strings for safety
                    const existingComment = task.comments?.find(
                        (comment) => comment._id.toString() === action.payload.comment._id.toString()
                    );
        
                    if (existingComment) {
                        // Update the existing comment's replies
                        console.log('Updating existing comment', existingComment);
                        return {
                            ...task,
                            comments: task.comments.map((comment) =>
                                comment._id.toString() === action.payload.comment._id.toString()
                                    ? { 
                                        ...comment, // Spread existing comment properties
                                        text: action.payload.comment.text // Update the text (or any other properties as needed)
                                      }
                                    : comment
                            ),
                        };
                        
                    } else {
                        // Add the new comment to the task
                        console.log('Adding new comment', action.payload.comment);
                        return {
                            ...task,
                            comments: [action.payload.comment, ...(task.comments || [])],
                        };
                    }
                }
                return task; // Return the task unchanged if it doesn't match
            });
        
            console.log("Updated Tasks: ", updatedTasks);
        
            // Return the updated state with the modified tasks for the relevant tab
            return {
                ...state,
                tasks: {
                    ...state.tasks, // Spread the existing tasks state
                    taskData: {
                        ...state.tasks.taskData, // Spread existing taskData
                        [tabId]: {
                            ...state.tasks.taskData[tabId], // Spread the existing tasks for the specific tab
                            tasks: updatedTasks, // Update the tasks array under the correct tab
                        },
                    },
                },
            };
        }
            
            
        
        case DELETE_COMMENT: {
            const { commentId, feedId, tab } = action.payload;
        
            // Create a copy of the current tasks state
            const updatedTasks = { ...state.tasks?.taskData };
        
            // Check if the specified tab exists in the updated tasks
            if (updatedTasks[tab] && updatedTasks[tab].tasks) {
                // Map through the tasks under the specified tab
                updatedTasks[tab].tasks = updatedTasks[tab].tasks.map((task) => {
                    if (task._id.toString() === feedId.toString()) {
                        // If the task has comments, filter out the deleted comment
                        const updatedComments = task.comments.filter((comment) => comment._id.toString() !== commentId.toString());
        
                        // Return the task with updated comments
                        return {
                            ...task,
                            comments: updatedComments,
                        };
                    }
                    // Return the task unchanged if it's not the one we're looking for
                    return task;
                });
            }
        
            // Return the updated state with the modified tasks for the relevant tab
            return {
                ...state,
                tasks: {
                    ...state.tasks, // Spread the existing tasks state
                    taskData: {
                        ...updatedTasks, // Use the updated tasks directly
                    },
                },
            };
        }
        
        default: return state;
      }
    };
    