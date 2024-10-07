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
    SHOW_TASK_MODAL
} from "../redux/actions/types";

export const dataObject = {
    // if active form type is project
    'project': {
        'state_key': PROJECT_FORM,
        'form_key': 'projectForm'
    },
    'edit_project': {
        'state_key': EDIT_PROJECT_FORM,
        'form_key': 'editProjectForm'
    },
    'task_create': {
        'state_key': TASK_FORM,
        'form_key': 'taskForm'
    },
    'task_edit': {
        'state_key': TASK_FORM,
        'form_key': 'taskForm'
    }
}