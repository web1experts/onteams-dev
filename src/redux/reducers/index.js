import { combineReducers } from "redux";
import authReducer from "./auth.reducer";
import projectReducer from "./project.reducer";
import taskReducer from "./task.reducer";
import memberReducer from "./member.reducer";
import clientReducer from "./client.reducer";
import trackingReducer from "./tracking.reducer";
import workspaceReducer from "./workspace.reducer";
import permissionReducer from "./permission.reducer";
import loaderReducer from './loaderReducer';
import workflowReducer from "./workflow.reducer";
import activityReducer from "./activity.reducer";
import commonReducer from "./common.reducer";
import holidayReducer from "./holiday.reducer";
import attendanceReducer from "./attendance.reducer";
import reportReducer from "./report.reducer";
import paymentReducer from "./payment.reducer";
import postReducer from "./post.reducer";
export default combineReducers({
  auth: authReducer,
  project: projectReducer,
  task: taskReducer,
  member: memberReducer,
  client: clientReducer,
  tracking: trackingReducer,
  workspace: workspaceReducer,
  loader: loaderReducer,   
  workflow: workflowReducer ,
  activity: activityReducer,
  common: commonReducer,
  holiday: holidayReducer,
  attendance: attendanceReducer,
  reports: reportReducer,
  permissions: permissionReducer,
  payment: paymentReducer,
  post: postReducer
});
