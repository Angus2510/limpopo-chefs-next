// app/constants/permissionTemplates.ts

export interface PermissionGroup {
  group: string;
  permissions: Array<{
    slug: string;
    name: string;
  }>;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: 'Dashboard',
    permissions: [
      { slug: 'view_dashboard', name: 'View Dashboard' },
      { slug: 'view_events', name: 'View Events' },
      { slug: 'create_events', name: 'Create Events' },
      { slug: 'edit_events', name: 'Edit Events' },
      { slug: 'delete_events', name: 'Delete Events' },
    ],
  },
  {
    group: 'Student Management',
    permissions: [
      { slug: 'view_students', name: 'View Students' },
      { slug: 'edit_students', name: 'Edit Students' },
      { slug: 'add_students', name: 'Add Students' },

      { slug: 'view_fees_paid', name: 'View Fees: Paid' },
      { slug: 'edit_fees_paid', name: 'Edit Fees: Paid' },

      { slug: 'view_fees_to_pay', name: 'View Fees: To Pay' },
      { slug: 'edit_fees_to_pay', name: 'Edit Fees: To Pay' },

      { slug: 'view_finance_sheet', name: 'View Finance Sheet' },

      { slug: 'view_student_attendance', name: 'View Student Attendance' },
      { slug: 'edit_student_attendance', name: 'Edit Student Attendance' },

      { slug: 'view_qr_attendance', name: 'View QR Attendance' },
      { slug: 'create_qr_attendance', name: 'Create QR Attendance' },
      { slug: 'edit_qr_attendance', name: 'Edit QR Attendance' },

      { slug: 'view_wel_attendance', name: 'View W.E.L Attendance' },
      { slug: 'add_wel_attendance', name: 'Add W.E.L Attendance' },
    ],
  },
  {
    group: 'Academic Management',
    permissions: [
      { slug: 'view_tests_tasks', name: 'View Tests/Tasks' },
      { slug: 'create_tests_tasks', name: 'Create Tests/Tasks' },
      { slug: 'edit_tests_tasks', name: 'Edit Tests/Tasks' },

      { slug: 'view_mark_tests_tasks', name: 'View Mark Tests/Tasks' },
      { slug: 'mark_tests_tasks', name: 'Mark Tests/Tasks' },
      { slug: 'moderate_tests_tasks', name: 'Moderate Tests/Tasks' },

      { slug: 'view_results', name: 'View Results' },
      { slug: 'edit_results', name: 'Edit Results' },

      { slug: 'view_results_sor', name: 'View Results S.O.R' },

      { slug: 'view_learning_material', name: 'View Learning Material' },
      { slug: 'upload_learning_material', name: 'Upload Learning Material' },
      { slug: 'edit_learning_material', name: 'Edit Learning Material' },
      { slug: 'delete_learning_material', name: 'Delete Learning Material' },
    ],
  },
  {
    group: 'General',
    permissions: [
      { slug: 'view_wel', name: 'View WEL' },
      { slug: 'edit_wel', name: 'Edit WEL' },
      { slug: 'add_wel', name: 'Add WEL' },

      { slug: 'add_notifications', name: 'Add Notifications' },

      { slug: 'view_accommodation', name: 'View Accommodation' },
      { slug: 'create_accommodation', name: 'Create Accommodation' },
      { slug: 'edit_accommodation', name: 'Edit Accommodation' },
      { slug: 'delete_accommodation', name: 'Delete Accommodation' },

      { slug: 'graduate_student', name: 'Graduate Student' },

      { slug: 'change_student_intake', name: 'Change Student Intake' },

      { slug: 'view_alumni', name: 'View Alumni' },
      { slug: 'edit_alumni', name: 'Edit Alumni' },
    ],
  },
  {
    group: 'Reports',
    permissions: [
      { slug: 'view_arrears_account', name: 'View Arrears Account' },
      { slug: 'generate_arrears_account', name: 'Generate Arrears Account' },

      { slug: 'view_moderation', name: 'View Moderation' },
      { slug: 'generate_moderation', name: 'Generate Moderation' },
    ],
  },
  {
    group: 'Settings',
    permissions: [
      { slug: 'view_campus', name: 'View Campus' },
      { slug: 'edit_campus', name: 'Edit Campus' },
      { slug: 'add_campus', name: 'Add Campus' },

      { slug: 'view_intake_group', name: 'View Intake Group' },
      { slug: 'edit_intake_group', name: 'Edit Intake Group' },
      { slug: 'add_intake_group', name: 'Add Intake Group' },

      { slug: 'view_outcome', name: 'View Outcome' },
      { slug: 'edit_outcome', name: 'Edit Outcome' },
      { slug: 'add_outcome', name: 'Add Outcome' },

      { slug: 'view_roles', name: 'View Roles' },
      { slug: 'edit_roles', name: 'Edit Roles' },
      { slug: 'add_roles', name: 'Add Roles' },

      { slug: 'view_qualifications', name: 'View Qualifications' },
      { slug: 'edit_qualifications', name: 'Edit Qualifications' },
      { slug: 'add_qualifications', name: 'Add Qualifications' },

      { slug: 'view_staff', name: 'View Staff' },
      { slug: 'edit_staff', name: 'Edit Staff' },
      { slug: 'add_staff', name: 'Add Staff' },
    ],
  },
];
