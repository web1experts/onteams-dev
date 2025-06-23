import { 
    CURRENT_PROJECT,
    SELECTED_MEMBERS,
    SELECTED_STATUS,
    SELECTED_WORKFLOW,
    SELECTED_FILES,
    CURRENT_TASK,
    SHOW_MEMBERS_MODAL,
    SHOW_FILES_MODAL,
    SHOW_PREVIEW_MODAL,
    SHOW_WORKFLOW_MODAL,
    SHOW_TASK_MODAL,
    SHOW_STATUS_MODAL,
    ALL_MEMBERS,
    PROJECT_FORM,
    TASK_FORM,
    ACTIVE_FORM_TYPE,
    SIDEBAR_OPEN,
    SIDEBAR_SMALL,
    THEME_COLOR
,} from "../actions/types";
export const updateStateData  = ( type, data = '' ) => {
    return async (dispatch) => {
        try {
            await dispatch({ type: type, payload: data });
        } catch (err) {
          
          console.log(err);
        }
      };
}
export const togglePopups = ( popup, popup_state ) => {
    return async (dispatch) => {
        switch (popup) {
            case 'status':
                await dispatch({ type: SHOW_STATUS_MODAL, payload: popup_state });
                break;
            case 'members':
                await dispatch({ type: SHOW_MEMBERS_MODAL, payload: popup_state });
                break;
            case 'workflow':
                await dispatch({ type: SHOW_WORKFLOW_MODAL, payload: popup_state });
                break;
            case 'files':
                await dispatch({ type: SHOW_FILES_MODAL, payload: popup_state });
                break;
            case "filepreview":
                await dispatch({ type: SHOW_PREVIEW_MODAL, payload: popup_state });
                break;
            case "taskform":
                await dispatch({ type: SHOW_TASK_MODAL, payload: popup_state });
                break;
            default:
                break;
        }
        
    }
}

export const toggleSidebar = ( payload ) => { 
    return async (dispatch) => {
        await dispatch({ type: SIDEBAR_OPEN, payload: payload });
    }
}

export const toggleSidebarSmall = ( payload ) => { 
    return async (dispatch) => {
        await dispatch({ type: SIDEBAR_SMALL, payload: payload });
    }
}

export const toggleTheme = (theme) => { 
    return async (dispatch) => {
        await dispatch({ type: THEME_COLOR, payload: theme})
    }
}