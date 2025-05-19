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
    "view": "View Projects",
    "view_others": "View Other Members Projects",
    "create_edit_delete_project": "Create/Edit/Delete Projects",
    "create_edit_delete_task": "Create/Edit/Delete Tasks",
    "update_projects_order": "Change Projects Order",
    "update_tasks_order": "Change Tasks Order"
  },
  clients: {
    "view": "View Clients",
    "create_edit_delete": "Create/Edit/Delete Clients"
  },
  members: {
    "view": "View Members",
    "create_edit_delete": "Create/Edit/Delete Members",
    "update_permissions": "Update Member Permissions"
  },
  tracking: {
    "view": "View Tracked Time",
    "view_others" : "View Others Tracked Time",
    "delete_recordings": "Delete Recordings"
    
  },
  reports: {
    "view": "View Report",
    "view_others": "View Other Members Report",
    "create_edit_delete": "Create/Edit/Delete Report",
    "update_manual_time": "Update Manual Time Of Members"
  },
  holidays: {
    "view": "View Holidays",
    "create_edit_delete": "Create/Edit/Delete Holidays"
  },
  attendance: {
    "view": "View Attendance",
    "create_edit": "Edit Attendance",
    "view_others": "View Other Members Attendance"
  }
}