// app/constants/categoryTemplates.ts

export interface CategoryTemplate {
  category: string;
  entities: Array<string>;
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    category: 'Dashboard',
    entities: ['Dashboard'],
  },
  {
    category: 'Student Management',
    entities: [
      'Student',
      'Paid',
      'To-Pay',
      'Sheet',
      'Student-Attendance',
      'QR-Attendance',
      'WEL-Attendance',
    ],
  },
  {
    category: 'Academic Management',
    entities: [
      'Tests/Tasks',
      'Tests/Tasks-Mark',
      'Tests/Tasks-Create',
      'Results',
      'Results-SOR',
      'Learning-Material',
    ],
  },
  {
    category: 'General',
    entities: [
      'WEL',
      'Notifications',
      'Accommodation',
      'Graduate',
      'Change-Intake',
      'Alumni',
    ],
  },
  {
    category: 'Reports',
    entities: ['Arrears-account', 'Moderation'],
  },
  {
    category: 'Settings',
    entities: ['Campus', 'Intake-Group', 'Outcome', 'Roles', 'Staff'],
  },
];
