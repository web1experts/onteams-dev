import {
    GET_PERMISSIONS_SUCCESS,
    GET_PERMISSIONS_FAILED
} from "../actions/types";
import * as auth from '../../helpers/auth';

const initialState = {
    success: null,
    statusCode: null,
    currentMember: {}
};

export default (state = initialState, action) => {
    
    switch (action.type) {
        
        case  GET_PERMISSIONS_SUCCESS  :
            return {
                currentMember: action.payload.memberdata
            }
        default: return state;
    }
};
