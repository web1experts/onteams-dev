import { 
    POST_FAILED,
    POST_LIST_SUCCESS,
    POST_SUCCESS,
    CLEAR_MESSAGES,
    LIKE_POST_SUCCESS,
    COMMENT_POST_SUCCESS,
    CREATE_POST_LIST_COMMENT,
    DELETE_COMMENT,
    DELETE_POST

} from "../actions/types";
    
    const initialState = {
        error: null,
        posts: null,
        comment: null,
        success:null,
        message: null,
        message_variant: null,
    };
    
    export default (state = initialState, action) => {
      switch (action.type) {
        case POST_SUCCESS :
            return {
                ...state,
                createPost: action.payload.post,
                success: true,
                message: action.payload.message,
                message_variant: 'success',
                error: null
            };
        case POST_FAILED :
            return {
                ...state,
                message: action.payload,
                message_variant: 'danger',
            }
        case POST_LIST_SUCCESS:
            
            return {
                posts: action.payload.posts
            }
        case CLEAR_MESSAGES :
            return {
                ...state,
                createPost: initialState.createPost,
                success: '',
                error: '',
                message: null,
                message_variant: null,
                singlePost: null
            }
        case LIKE_POST_SUCCESS: 
            return {
                ...state,
                singlePost: action.payload.post
            }
        case CREATE_POST_LIST_COMMENT: {
            if(action.payload.type !== 'post'){return {...state}}
            return {
                ...state,
                singlePost: action.payload.updatedPost
            }
        }
        case DELETE_COMMENT: {
            if(action.payload.type !== 'post'){return {...state}}
            return {
                ...state,
                singlePost: action.payload.updatedPost
            }
        }
        case DELETE_POST: {
            return {
                ...state,
                deletePost: action.payload.deletedPost
            }
        }
        default: return state;
      }
    };
    