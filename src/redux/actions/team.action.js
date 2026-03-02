import { get } from "lodash";
import API from "../../helpers/api";
import {
  TEAM_COMMON_ERROR,
  TEAM_LIST_SUCCESS,
  TEAM_CREATE_SUCCESS,
  TEAM_UPDATE_SUCCESS,
  TEAM_DELETE_SUCCESS,
} from "./types";

const config = {
  headers: {
    'Content-Type': "application/json; charset=utf-8"
  }
}

function errorRequest(err, dispatch) {
  let data = get(err, "response.data", null);
  data = data || get(err, "response");
  data = data || err;

  dispatch({
    type: TEAM_COMMON_ERROR,
    payload: data?.message || "Something went wrong",
  });
}


/**
 * Get All Teams
 */
export const getTeams = () => {
  return async (dispatch) => {
    try {
      const response = await API.apiGet("teams");

      if (response.data && response.data.success) {
        dispatch({
          type: TEAM_LIST_SUCCESS,
          payload: response.data.data,
        });
      } else {
        dispatch({
          type: TEAM_COMMON_ERROR,
          payload: response.data.message,
        });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
};


/**
 * Create Team
 */
export const createTeam = (payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPost("teams", payload);

      if (response.data && response.data.success) {
        dispatch({
          type: TEAM_CREATE_SUCCESS,
          payload: response.data.data,
        });
      } else {
        dispatch({
          type: TEAM_COMMON_ERROR,
          payload: response.data.message,
        });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
};


/**
 * Update Team
 */
export const updateTeam = (teamId, payload) => {
  return async (dispatch) => {
    try {
      const response = await API.apiPutUrl('teams', `/${teamId}`, payload);

      if (response.data && response.data.success) {
        dispatch({
          type: TEAM_UPDATE_SUCCESS,
          payload: response.data.data,
        });
      } else {
        dispatch({
          type: TEAM_COMMON_ERROR,
          payload: response.data.message,
        });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
};


/**
 * Delete Team
 */
export const deleteTeam = (teamId) => {
  return async (dispatch) => {
    try {
      const response = await API.apiDeleteUrl('teams',`/${teamId}`);

      if (response.data && response.data.success) {
        dispatch({
          type: TEAM_DELETE_SUCCESS,
          payload: teamId,
        });
      } else {
        dispatch({
          type: TEAM_COMMON_ERROR,
          payload: response.data.message,
        });
      }
    } catch (err) {
      errorRequest(err, dispatch);
    }
  };
};