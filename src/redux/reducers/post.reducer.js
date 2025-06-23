import { 
    POST_FAILED,
    POST_LIST_SUCCESS,
    POST_SUCCESS,
    CLEAR_MESSAGES

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
            }
        default: return state;
      }
    };
    