export interface PermissionTemplate {
  entity: string;
  operations: Array<string>;
}

// Predefined templates based on the navigation
export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    entity: 'Dashboard',
    operations: ['view'],
  },
  {
    entity: 'Event',
    operations: ['create', 'edit', 'delete'],
  },
  {
    entity: 'Student',
    operations: ['view', 'add', 'edit'],
  },
  {
    entity: 'Paid',
    operations: ['view', 'edit'],
  },
  {
    entity: 'To-Pay',
    operations: ['view', 'edit'],
  },
  {
    entity: 'Sheet',
    operations: ['view'],
  },
  {
    entity: 'Student-Attendance',
    operations: ['view', 'edit'],
  },
  {
    entity: 'QR-Attendance',
    operations: ['view', 'create', 'edit'],
  },
  {
    entity: 'WEL-Attendance',
    operations: ['view', 'add'],
  },
  {
    entity: 'Tests/Tasks-Mark',
    operations: ['view', 'mark', 'moderate'],
  },
  {
    entity: 'Tests/Tasks',
    operations: ['view', 'create', 'edit'],
  },
  {
    entity: 'Results',
    operations: ['view', 'edit'],
  },
  {
    entity: 'Results-SOR',
    operations: ['view'],
  },
  {
    entity: 'Learning-Material',
    operations: ['view', 'edit', 'upload', 'delete'],
  },
  {
    entity: 'WEL',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Notifications',
    operations: ['add'],
  },
  {
    entity: 'Accommodation',
    operations: ['view', 'create', 'edit', 'delete'],
  },
  {
    entity: 'Graduate',
    operations: ['graduate'],
  },
  {
    entity: 'Change-Intake',
    operations: ['transfer'],
  },
  {
    entity: 'Alumni',
    operations: ['view', 'edit'],
  },

  {
    entity: 'Moderation',
    operations: ['generate', 'view'],
  },
  {
    entity: 'Arrears-account',
    operations: ['generate', 'view'],
  },
  {
    entity: 'Roles',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Campus',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Intake-Group',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Outcome',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Qualification',
    operations: ['view', 'edit', 'add'],
  },
  {
    entity: 'Staff',
    operations: ['view', 'edit', 'add'],
  },
];
