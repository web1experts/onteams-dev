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
      "view_others"
    ],
  },
  {
    name: "Reports",
    slug: 'reports',
    permissions: [
      "view",
      "view_others",
      "create_edit_delete"
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