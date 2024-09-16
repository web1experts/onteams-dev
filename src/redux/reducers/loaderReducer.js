// src/redux/reducers/loaderReducer.js
import { SHOW_LOADER, HIDE_LOADER } from "../actions/types";

const initialState = {
  loading: false,
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_LOADER:
      return { ...state, loading: true };
    case HIDE_LOADER:
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default loaderReducer;
