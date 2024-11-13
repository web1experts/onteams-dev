import { 
    CURRENT_PROJECT,
    SELECTED_MEMBERS,
    SELECTED_STATUS,
    DIRECT_UPDATE,
    SELECTED_FILES,
    CURRENT_TASK,
    SHOW_MEMBERS_MODAL,
    SHOW_FILES_MODAL,
    SHOW_WORKFLOW_MODAL,
    SHOW_STATUS_MODAL,
    ALL_MEMBERS,
    ALL_CLIENTS,
    PROJECT_FORM,
    EDIT_PROJECT_FORM,
    TASK_FORM,
    ACTIVE_FORM_TYPE,
    RESET_FORMS,
    SHOW_PREVIEW_MODAL,
    ASSIGN_MEMBER,
    TASK_FORM_TYPE,
    SHOW_TASK_MODAL,
    CREATE_POST_LIST_COMMENT
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
    editProjectForm: {},
    taskForm: {},
    active_formtype: null,
    task_formtype: null,
    assign_members_direct: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_PROJECT :
        return {
            ...state,
            currentProject: action.payload
          };
      
    case ASSIGN_MEMBER :
        return {
            ...state,
            assign_members_direct: action.payload
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
    case TASK_FORM: 
      
        return {
            ...state,
            taskForm: { ...state.taskForm, ...action.payload }
        }
    case EDIT_PROJECT_FORM: 
        return {
            ...state,
            editProjectForm: { ...state.editProjectForm, ...action.payload }
        }
    case ACTIVE_FORM_TYPE: 
        return {
            ...state,
            active_formtype: action.payload
        }
    case SHOW_TASK_MODAL: 
        return {
            ...state,
            taskmodal: action.payload
        }
    case RESET_FORMS: 
    if(action.payload === "edit_project"){ console.log('reset project')
        return {
            ...state,
            currentProject: false,
            editProjectForm: {},
        }
    }else if(action.payload === "task"){
        return {
            ...state,
            taskForm: {},
        }
    }else{
        return {
            ...state,
            projectForm: {},
        }
    }
    case DIRECT_UPDATE:
        return {
            ...state,
            directUpdate: action.payload
        }
    case TASK_FORM_TYPE: 
        return {
            ...state,
            task_formtype: action.payload
        }
    
    default: return state;
  }
};
