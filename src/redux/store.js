import { createStore, applyMiddleware, compose } from "redux";
import { thunk } from 'redux-thunk';
import promise from "redux-promise-middleware";
import rootReducer from "./reducers";

const initialState = {};

/**
 *  Create Store and apply thunk and user promise middleware
 */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// export default createStore(rootReducer, initialState, applyMiddleware(thunk, promise));

const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(thunk, promise))
  );
  
  export default store;