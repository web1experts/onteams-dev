import {
  TEAM_COMMON_ERROR,
  TEAM_LIST_SUCCESS,
  TEAM_CREATE_SUCCESS,
  TEAM_UPDATE_SUCCESS,
  TEAM_DELETE_SUCCESS,
  CLEAR_MESSAGES,
} from "../actions/types";

const initialState = {
  teams: [],
  message: null,
  message_variant: null,
};

export default (state = initialState, action) => {
  switch (action.type) {

    case TEAM_LIST_SUCCESS:
      return {
        ...state,
        teams: action.payload,
        message: null,
      };

    case TEAM_CREATE_SUCCESS:
      return {
        ...state,
        teams: [...state.teams, action.payload],
        message: "Team created successfully",
        message_variant: "success",
      };

    case TEAM_UPDATE_SUCCESS:
      return {
        ...state,
        teams: state?.teams?.map((team) =>
          team._id === action.payload._id ? action.payload : team
        ),
        message: "Team updated successfully",
        message_variant: "success",
      };

    case TEAM_DELETE_SUCCESS:
      return {
        ...state,
        teams: state.teams.filter(
          (team) => team._id !== action.payload
        ),
        message: "Team deleted successfully",
        message_variant: "success",
      };

    case TEAM_COMMON_ERROR:
      return {
        ...state,
        message: action.payload,
        message_variant: "danger",
      };

    case CLEAR_MESSAGES:
      return {
        ...state,
        message: null,
        message_variant: null,
      };

    default:
      return state;
  }
};