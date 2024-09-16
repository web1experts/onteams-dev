import { 
    GET_DASHBOARD_STATS_SUCCESS,
    GET_DASHBOARD_STATS_FAILED,
    DASHBOARD_COMMON_ERROR
} from "../actions/types";

const initialState = {
  error: null,
  getAll: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_DASHBOARD_STATS_SUCCESS:
        return {
            ...state,
            getAll: action.payload.result,
            error: null
        }
    case GET_DASHBOARD_STATS_FAILED: 
        return {
            error: action.payload,
        }
    case DASHBOARD_COMMON_ERROR: 
        return {
            error: action.payload, 
        }
    default: return state;
  }
};
