import { 
    CURRENT_PROJECT,
    SELECTED_MEMBERS,
    SELECTED_STATUS,
    SELECTED_WORKFLOW,
    SELECTED_FILES,
    CURRENT_TASK,
    SHOW_MEMBERS_MODAL,
    SHOW_FILES_MODAL,
    SHOW_WORKFLOW_MODAL,
    SHOW_STATUS_MODAL,
    ALL_MEMBERS,
    ALL_CLIENTS,
    PROJECT_FORM,
    TASK_FORM,
    ACTIVE_FORM_TYPE,
    RESET_FORMS,
    SHOW_PREVIEW_MODAL
} from "../actions/types";

const initialState = {
    error: null,
    currentProject: false,
    selectedMembers: [],
    selectedStatus: '',
    workflowmodal: false,
    currentTask: {},
    files: [],
    statusModal: false,
    membersModal: false,
    allmembers: [],
    projectForm: {},
    taskForm: {},
    active_formtype: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_PROJECT :
        return {
            ...state,
            currentProject: action.payload
          };
          
    case SELECTED_MEMBERS :
        return {
            ...state,
            selectedMembers: action.payload
        };
    
    case SELECTED_STATUS :
        return {
            ...state,
            selectedStatus: action.payload
          };
          
    case SHOW_WORKFLOW_MODAL :
        return {
            ...state,
            workflowmodal: action.payload
        };
    case SHOW_FILES_MODAL :
        return {
            ...state,
            filesmodal: action.payload
        };
    case SELECTED_FILES: 
        return {
            ...state,
            files: action.payload.files
        }
    case CURRENT_TASK: 
        return {
            ...state,
            files: action.payload.currentTask
        }
    case SHOW_STATUS_MODAL: 
        return {
            ...state,
            statusModal: action.payload
        }
    case SHOW_PREVIEW_MODAL: 
        return {
            ...state,
            previewfilesmodal: action.payload
        }
    case SHOW_MEMBERS_MODAL: 
        return {
            ...state,
            membersModal: action.payload
        }
    case ALL_MEMBERS: 
        return {
            ...state,
            allmembers: action.payload
        }
    case ALL_CLIENTS: 
        return {
            ...state,
            allclients: action.payload
        }
    case PROJECT_FORM: 
        return {
            ...state,
            projectForm: { ...state.projectForm, ...action.payload }
        }
    case ACTIVE_FORM_TYPE: 
        return {
            ...state,
            active_formtype: action.payload
        }
    case RESET_FORMS: 
        return {
            ...state,
            projectForm: {},
            taskForm: {}
        }
    default: return state;
  }
};
