import React from 'react';
import { FiEdit, FiCalendar} from "react-icons/fi";
import { LuFolderOpen, LuUsers, LuTimer, LuChartLine } from "react-icons/lu";
import { BsEye } from "react-icons/bs";
import { TbArrowsDownUp } from "react-icons/tb";
import { CgCalendarDates } from 'react-icons/cg';
export const permissionModules = [
  {
    name: "Assigned Teams",
    slug: 'assigned_teams',
    permissions: [
      "specific_teams_only",
      "specific_peoples_only",
    ],
  },
  {
    name: "Projects",
    slug: 'projects',
    permissions: [
      "view",
      "view_others",
      "view_unassigned",
      "create_edit_delete_project",
      "create_edit_delete_task",
      "update_projects_order",
      "update_tasks_order",
      "manage_custom_fields"
    ],
  },
  {
    name: "Client",
    slug: 'clients',
    permissions: [
      "view",
      "create_edit_delete",
      "manage_custom_fields"
    ],
  },
  {
    name: "Team Members",
    slug: 'members',
    permissions: [
      "view",
      "create_edit_delete",
      "manage_custom_fields",
      "manage_teams",
      "update_permissions"
    ],
  },
  {
    name: "Time Tracking",
    slug: 'time_tracking',
    permissions: [
      "view",
      "view_others",
      "update_manual_time",
      "delete_recordings",
      "add_manual_time"
    ],
  },
  {
    name: "Reports",
    slug: 'reports',
    permissions: [
      "view",
      "view_others"
    ],
  },
  {
    name: "Holidays",
    slug: 'holidays',
    permissions: [
      "view",
      "create_edit_delete"
    ],
  },
  {
    name: "Attendance",
    slug: 'attendance',
    permissions: [
      "view",
      "view_others",
      "create_edit"
    ],
  }
];

export const permissionsLabel = {
  "assigned_teams": {
    "heading": 'Assigned Teams',
    "sub_heading": "For team leads, managers, and HRs to view their team's data, projects, time tracking, reports, and attendance",
    "icon": <LuFolderOpen />,
    "specific_teams_only": {
      heading: "Can see specific teams only",
      sub_heading: "Ideal for team leads and managers. All current and future members of selected teams will be automatically visible.",
      "icon": <BsEye />,
    },
    "specific_peoples_only": {
      heading: "Can see specific people only",
      sub_heading: "For precise control. Manually select individual team members. Optionally auto-include future members from specific teams.",
      "icon": <BsEye />,
    }
  },
  "projects": {
    "heading": 'Project Management',
    "sub_heading": "Projects and tasks access",
    "icon": <LuFolderOpen />,
    "view": {
      heading: "View projects",
      // sub_heading: 'Can view assigned projects and tasks',
      "icon": <BsEye />,
    },
    "view_others": {
      heading: "View team projects",
      // sub_heading: "This role can see: All teams + future teams",
      "icon": <LuUsers />,
    } ,
    "view_unassigned": {
      heading: "View unassigned projects",
      "icon": <LuUsers />,
    },
    "create_edit_delete_project":  {
      heading: "Manage projects (add, edit, delete)",
      // sub_heading: "Create, edit, and delete projects",
      "icon": <LuFolderOpen />,
    },
    "create_edit_delete_task": {
      heading: "Manage tasks (add, edit, delete)",
      // sub_heading: "Create, edit, and delete tasks",
      "icon": <FiEdit />,
    } ,
    "update_projects_order": {
      heading: "Reorder projects",
      // sub_heading: "Reorder and organize projects",
      "icon": <TbArrowsDownUp />,
    },
    "update_tasks_order": {
      heading: "Reorder tasks",
      // sub_heading: "Reorder and organize tasks",
      "icon": <TbArrowsDownUp />,
    },
    "manage_custom_fields": {
      heading: "Manage custom fields (add, edit, delete)",
      "icon": <TbArrowsDownUp />,
    },
  },
  clients: {
    "heading" : 'Client Management',
    "sub_heading": "Clients access and management permissions",
    "icon": <LuUsers />,
    "view": {
      "icon": <BsEye />,
      heading: "View clients",
      // sub_heading: "View client lists"
    },
    "create_edit_delete": {
      "icon": <LuFolderOpen />,
      heading: "Manage clients (add, edit, delete)",
      // sub_heading: "Create, edit, and delete clients"
    },
    "manage_custom_fields": {
      heading: "Manage custom fields (add, edit, delete)",
      "icon": <TbArrowsDownUp />,
    },
  },
  members: {
    "icon": <BsEye />,
    "heading": "Team Management",
    "sub_heading": "Member and permission control",
    "view": {
      "icon": <BsEye />,
      heading: "View team members",
      // sub_heading: "Can view team members"
    },
    "create_edit_delete": {
      "icon": <BsEye />,
      heading: "Manage team members (add, edit, remove member)",
      // sub_heading: "Create, edit, and delete members"
    },
    "manage_custom_fields": {
      heading: "Manage custom fields (add, edit, delete)",
      "icon": <TbArrowsDownUp />,
    },
    "update_permissions": {
      "icon": <BsEye />,
      heading: "Manage roles (add, edit, delete)",
      caution: true,
      caution_text: "This is a powerful permission that grants full control over who can do what. Anyone with this permission can assign themselves or others any role and customize permissions. Only grant this to highly trusted team members."
      // sub_heading: "Modify member's permissions"
    },
    "manage_teams": {
      "icon": <BsEye />,
      heading: "Manage teams (add, edit, delete)"
    }
  },
  time_tracking: {
    "icon": <LuTimer />,
    "heading": "Time Tracking",
    "sub_heading": "Time entry management",
    "view": {
      "icon": <BsEye />,
      heading: "View own time",
      // sub_heading: "Can view assigned projects and tasks"
    },
    "view_others" : { heading: "View team time",
      "icon": <LuUsers />,
      // sub_heading: "Can view other team members work"
    },
    "delete_recordings": {
      "icon": <LuFolderOpen />,
      heading: "Delete screenshots/screen recordings",
      // sub_heading: "Can delete recordings"
    },
    "add_manual_time": {
      "icon": <LuFolderOpen />,
      heading: "Add manual time",
      // sub_heading: "Can delete recordings"
    },
    "update_manual_time": {
      "icon": <FiEdit />,
      heading: "Approve/Reject manual time"
      // sub_heading: "Manual time approve/disapprove"
    }
    
  },
  reports: {
    "icon": <LuChartLine />,
    "heading": "Reports",
    "sub_heading": "Analytics and insights",
    "view": {
      "icon": <BsEye />,
      heading: "View reports",
      // sub_heading: "Can view team reports, manual time and tasks"
    },
    "view_others": { heading: "View team reports",
      "icon": <LuUsers />,
      // sub_heading: "Can view other team members work"
    }
  },
  holidays: {
    "icon": <FiCalendar />,
    "heading": "Holidays",
    "sub_heading": "Leave management",
    "view": {
      "icon": <BsEye />,
      heading: "View holidays"
      // sub_heading: "Can view past and upcoming holidays"
    },
    "create_edit_delete": {
      "icon": <LuFolderOpen />,
      heading: "Manage holidays (add, edit, delete)"
      // sub_heading: "Create, edit, and delete holidays"
    }
  },
  attendance: {
     "icon": <CgCalendarDates />,
    "heading": "Attendance",
    "sub_heading": "Attendance management",
    "view": {
      "icon": <BsEye />,
      heading: "View attendance"
      // sub_heading: "View mambers daily attendance"
    },
    "create_edit": {
      "icon": <LuFolderOpen />,
      heading: "Attendance rules (add, edit, delete)"
      // sub_heading: "Create, edit, and delete member attendance"
    },
    "view_others": {
      "icon": <LuUsers />,
      heading: "View team attendance"
      // sub_heading: "Can view other team members attendance"
    },
  }
}