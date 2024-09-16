import { 
    TIME_TRACKING_STATUS,
    TRACKING_COMMON_ERROR,
} from "../actions/types";

const initialState = {
    error: null,
    tracking: {} // Changed to a simple object
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TIME_TRACKING_STATUS:
            const { userId, status, project } = action.payload;
            // Update the tracking object with the new status and project for the userId
            return {
                ...state,
                tracking: {
                    ...state.tracking,
                    [userId]: {
                        status,
                        project
                    }
                }
            };
        default: 
            return state;
    }
};
