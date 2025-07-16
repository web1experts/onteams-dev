import React from 'react';
import { FiEdit, FiMail, FiSidebar, FiBriefcase, FiShield, FiVideo, FiCamera, FiMonitor, FiUserCheck, FiCalendar, FiCheck} from "react-icons/fi";
import { LuFolderOpen, LuUsers, LuTimer, LuChartLine } from "react-icons/lu";
import { BsEye } from "react-icons/bs";
import { TbArrowsDownUp } from "react-icons/tb";
import { CgCalendarDates } from 'react-icons/cg';
export const permissionModules = [
  {
    name: "Projects",
    slug: 'projects',
    permissions: [
      "view",
      "view_others",
      "create_edit_delete_project",
      "create_edit_delete_task",
      "update_projects_order",
      "update_tasks_order",
    ],
  },
  {
    name: "Client",
    slug: 'clients',
    permissions: [
      "view",
      "create_edit_delete"
    ],
  },
  {
    name: "Team Members",
    slug: 'members',
    permissions: [
      "view",
      "create_edit_delete",
      "update_permissions"
    ],
  },
  {
    name: "Time Tracking",
    slug: 'tracking',
    permissions: [
      "view",
      "view_others",
      "delete_recordings"

    ],
  },
  {
    name: "Reports",
    slug: 'reports',
    permissions: [
      "view",
      "view_others",
      "create_edit_delete",
      "update_manual_time"
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
      "create_edit",
      "view_others"
    ],
  } 
];

export const permissionsLabel = {
  "projects": {
    "heading": 'Project Management',
    "sub_heading": "Project access and management permissions",
    "icon": <LuFolderOpen />,
    "view": {
      heading: "View Projects",
      sub_heading: 'Can view assigned projects and tasks',
      "icon": <BsEye />,
    },
    "view_others": {
      heading: "Team Visibility",
      sub_heading: "Can view other team members projects",
      "icon": <LuUsers />,
    } ,
    "create_edit_delete_project":  {
      heading: "Project Management",
      sub_heading: "Create, edit, and delete projects",
      "icon": <LuFolderOpen />,
    },
    "create_edit_delete_task": {
      heading: "Task Management",
      sub_heading: "Create, edit, and delete tasks",
      "icon": <FiEdit />,
    } ,
    "update_projects_order": {
      heading: "Project Ordering",
      sub_heading: "Reorder and organize projects",
      "icon": <TbArrowsDownUp />,
    },
    "update_tasks_order": {
      heading: "Task Ordering",
      sub_heading: "Reorder and organize tasks",
      "icon": <TbArrowsDownUp />,
    }
  },
  clients: {
    "heading" : 'Client Management',
    "sub_heading": "Clients access and management permissions",
    "icon": <LuUsers />,
    "view": {
      "icon": <BsEye />,
      heading: "Client Viewing",
      sub_heading: "View client lists"
    },
    "create_edit_delete": {
      "icon": <LuFolderOpen />,
      heading: "Client Management",
      sub_heading: "Create, edit, and delete clients"
    }
  },
  members: {
    "icon": <BsEye />,
    "heading": "Team Management",
    "sub_heading": "Manage team operations",
    "view": {
      "icon": <BsEye />,
      heading: "Members Viewing",
      sub_heading: "Can view team members"
    },
    "create_edit_delete": {
      "icon": <BsEye />,
      heading: "Members Management",
      sub_heading: "Create, edit, and delete members"
    },
    "update_permissions": {
      "icon": <BsEye />,
      heading: "Member's Permissions",
      sub_heading: "Modify member's permissions"
    }
  },
  tracking: {
    "icon": <LuTimer />,
    "heading": "Time Tracking Management",
    "sub_heading": "Manage time tracking permissions",
    "view": {
      "icon": <BsEye />,
      heading: "Time Tracking Viewing",
      sub_heading: "Can view assigned projects and tasks"
    },
    "view_others" : { heading: "Team Visibility",
      "icon": <LuUsers />,
      sub_heading: "Can view other team members work"},
    "delete_recordings": {
      "icon": <LuFolderOpen />,
      heading: "Recording Management",
      sub_heading: "Can delete recordings"
    }
    
  },
  reports: {
    "icon": <LuChartLine />,
    "heading": "Reports Management",
    "sub_heading": "Reports access and management permissions",
    "view": {
      "icon": <BsEye />,
      heading: "Reports Viewing",
      sub_heading: "Can view team reports, manual time and tasks"
    },
    "view_others": { heading: "Team Visibility",
      "icon": <LuUsers />,
      sub_heading: "Can view other team members work"},
    "create_edit_delete": {
      "icon": <LuFolderOpen />,
      heading: "Reports Management",
      sub_heading: "Create, edit, and delete reports"
    },
    "update_manual_time": {
      "icon": <FiEdit />,
      heading: "Time Management",
      sub_heading: "Manual time update"
    }
  },
  holidays: {
    "icon": <FiCalendar />,
    "heading": "Holidays Management",
    "sub_heading": "Manage upcoming and past holidays",
    "view": {
      "icon": <BsEye />,
      heading: "Holidays Viewing",
      sub_heading: "Can view past and upcoming holidays"
    },
    "create_edit_delete": {
      "icon": <LuFolderOpen />,
      heading: "Holiday Management",
      sub_heading: "Create, edit, and delete holidays"
    }
  },
  attendance: {
     "icon": <CgCalendarDates />,
    "heading": "Attendance Management",
    "sub_heading": "Manage members daily attendance",
    "view": {
      "icon": <BsEye />,
      heading: "Attendance Viewing",
      sub_heading: "View mambers daily attendance"
    },
    "create_edit": {
      "icon": <LuFolderOpen />,
      heading: "Attendance Management",
      sub_heading: "Create, edit, and delete member attendance"
    },
    "view_others": {
      "icon": <LuUsers />,
      heading: "Team Visibility",
      sub_heading: "Can view other team members attendance"
    },
  }
}