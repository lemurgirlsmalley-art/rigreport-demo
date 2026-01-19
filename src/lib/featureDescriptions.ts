/**
 * Feature descriptions for the demo app.
 * These describe what the production RigReport actually does.
 * Based on the actual production codebase features.
 */

export interface FeatureDescription {
  title: string;
  description: string;
  productionFeatures: string[];
  icon?: 'edit' | 'delete' | 'add' | 'sync' | 'export' | 'notification' | 'user' | 'settings' | 'search' | 'filter';
}

export const featureDescriptions: Record<string, FeatureDescription> = {
  // Boat Management
  editBoat: {
    title: 'Edit Boat Details',
    description: 'In production RigReport, coaches and admins can edit all boat information.',
    productionFeatures: [
      'Update display name, sail number, and boat type',
      'Change storage location and organization',
      'Edit manufacturer, length, and year built',
      'Update HIN, registration, trailer VIN, and motor serial',
      'Manage insurance details (limit, deductible)',
      'Set GPS coordinates for map display',
      'Upload and manage boat photos',
      'Toggle regatta preferred status',
    ],
    icon: 'edit',
  },
  deleteBoat: {
    title: 'Delete Boat',
    description: 'Production RigReport allows coaches and admins to remove boats from the fleet.',
    productionFeatures: [
      'Permanently remove boat from fleet registry',
      'Automatically deletes all maintenance entries for that boat',
      'Requires coach or admin role',
    ],
    icon: 'delete',
  },
  addBoat: {
    title: 'Add New Boat',
    description: 'Production RigReport enables coaches and admins to register new vessels.',
    productionFeatures: [
      'Enter display name, sail number, and boat type',
      'Assign to organization (EO, YOH, or DSC)',
      'Set initial status and storage location',
      'Add manufacturer, length, year built details',
      'Enter HIN, registration, trailer VIN, motor serial',
      'Configure insurance limit and deductible',
      'Set GPS coordinates for fleet map',
      'Upload boat photo',
    ],
    icon: 'add',
  },

  // Equipment Management
  editEquipment: {
    title: 'Edit Equipment',
    description: 'Production RigReport allows coaches and admins to update equipment details.',
    productionFeatures: [
      'Update name, type, and storage location',
      'Change status (OK, Needs repair, Out of service)',
      'Edit notes and description',
      'Update insurance information',
      'Modify purchase date and last inspection date',
    ],
    icon: 'edit',
  },
  addEquipment: {
    title: 'Add Equipment',
    description: 'Register new equipment items in the production system.',
    productionFeatures: [
      'Enter name and select type (Trailer, Sail, Rigging, Dolly, Motor, Safety, Other)',
      'Assign to organization',
      'Set storage location and initial status',
      'Add insurance details and purchase date',
      'Include notes and description',
    ],
    icon: 'add',
  },

  // Maintenance & Damage Reports
  flagIssue: {
    title: 'Flag Issue',
    description: 'Production RigReport allows any user to quickly flag issues on a boat.',
    productionFeatures: [
      'Report damage or issues directly from boat details page',
      'Select category (Inspection, Repair, Rigging issue, Hull damage, etc.)',
      'Set severity level (Low, Medium, High)',
      'High severity automatically sets boat status to "Do not sail"',
      'Creates maintenance entry linked to the boat',
      'Records reporter and timestamp automatically',
    ],
    icon: 'notification',
  },
  saveLogEntry: {
    title: 'Save Log Entry',
    description: 'Production RigReport saves maintenance and inspection log entries to the database.',
    productionFeatures: [
      'Creates new maintenance record in database',
      'Associates entry with the specific boat',
      'Records category, severity, and description',
      'Optionally includes parts used and cost estimate',
      'Auto-updates boat\'s last inspection date',
      'High severity entries automatically change boat status',
      'Entry appears in boat\'s maintenance history',
    ],
    icon: 'add',
  },
  markBoatOK: {
    title: 'Mark Boat as OK',
    description: 'Production RigReport allows coaches and admins to mark a boat as ready to sail.',
    productionFeatures: [
      'Changes boat status to "OK"',
      'Clears any "Do not sail" or "Needs repair" status',
      'Updates last status change timestamp',
      'Requires coach or admin role',
      'Boat becomes available for sailing and regattas',
    ],
    icon: 'edit',
  },
  submitDamageReport: {
    title: 'Submit Damage Report',
    description: 'Production RigReport captures damage reports from any authenticated user.',
    productionFeatures: [
      'Select boat or equipment to report on',
      'Choose category (Inspection, Repair, Rigging issue, Hull damage, etc.)',
      'Set severity level (Low, Medium, High)',
      'Add detailed description of the issue',
      'Optionally include parts used and cost estimate',
      'High severity automatically sets boat to "Do not sail"',
      'Auto-updates last inspection date and inspector',
    ],
    icon: 'notification',
  },
  resolveMaintenance: {
    title: 'Resolve Maintenance Issue',
    description: 'Close out maintenance items and update records.',
    productionFeatures: [
      'Change status from Open to In Progress or Resolved',
      'Record who resolved the issue and when',
      'Add resolution notes and parts used',
      'Update cost estimate with actual costs',
    ],
    icon: 'edit',
  },

  // User Management
  inviteUser: {
    title: 'User Registration',
    description: 'Production RigReport has a registration and approval workflow.',
    productionFeatures: [
      'Users register with email and password',
      'Select role: Admin, Coach, Volunteer, or Junior Sailor',
      'Volunteers are auto-approved on registration',
      'Admin and Coach roles require admin approval',
      'Admins receive email notification of new registrations',
      'Approved users receive confirmation email',
    ],
    icon: 'user',
  },
  editUserRole: {
    title: 'Manage User',
    description: 'Admins can manage user accounts in production RigReport.',
    productionFeatures: [
      'View user details and role',
      'Approve pending user registrations',
      'Deny user registration requests',
      'Users receive email notification of approval/denial',
    ],
    icon: 'user',
  },
  deleteUser: {
    title: 'Remove User',
    description: 'Admins can remove users from the organization.',
    productionFeatures: [
      'Permanently remove user account',
      'Cannot delete your own account',
      'Requires admin role',
    ],
    icon: 'delete',
  },

  // Data Operations
  exportData: {
    title: 'Export to Excel',
    description: 'Production RigReport exports fleet data to Excel spreadsheets.',
    productionFeatures: [
      'Export fleet list to .xlsx file',
      'Includes: Display Name, Sail Number, Boat Type, Organization',
      'Includes: Status, Storage Location, Last Inspection, Regatta Preferred',
      'Filename includes current date for easy organization',
    ],
    icon: 'export',
  },
  exportFleet: {
    title: 'Export Fleet to Excel',
    description: 'Production RigReport exports complete fleet data to a downloadable Excel spreadsheet.',
    productionFeatures: [
      'Creates .xlsx file with all fleet data',
      'Columns: Display Name, Sail Number, Hull ID (HIN), Boat Type',
      'Columns: Organization, Status, Storage Location',
      'Columns: Registration, Reg. Expiration, Insurance Limit, Deductible',
      'Columns: Last Inspection date, Regatta Preferred (Yes/No)',
      'Auto-sizes columns for readability',
      'Filename format: RigReport_Fleet_YYYY-MM-DD.xlsx',
    ],
    icon: 'export',
  },
  exportSlips: {
    title: 'Export Slips to Excel',
    description: 'Production RigReport exports comprehensive slip management data to a multi-sheet Excel workbook.',
    productionFeatures: [
      'Sheet 1: Slips - Number, dock, dimensions, amenities, rates, insurance',
      'Sheet 2: Members - Contact info, address, emergency contacts',
      'Sheet 3: Member Assignments - Slip assignments with roles and dates',
      'Sheet 4: Boats - Boat details, registration, HIN for each slip',
      'Sheet 5: Payments - Payment history with amounts, dates, methods',
      'Intelligent name resolution (shows names instead of IDs)',
      'Filename format: slips-export-YYYY-MM-DD.xlsx',
    ],
    icon: 'export',
  },

  // Slip Management
  addSlip: {
    title: 'Add New Slip',
    description: 'Production RigReport allows admins to register new marina slips with full details.',
    productionFeatures: [
      'Enter slip number, display name, and assign to dock',
      'Select slip type: Standard, Large, Covered, End Tie, or T-Head',
      'Set dimensions: length, width, and depth',
      'Configure amenities: electric and water hookups',
      'Set monthly and annual rental rates',
      'Add location description and notes',
      'Slip becomes available for member assignment',
    ],
    icon: 'add',
  },

  // User Management Actions
  approveUser: {
    title: 'Approve User Registration',
    description: 'Production RigReport has a registration approval workflow for coaches and admins.',
    productionFeatures: [
      'Review pending user registration requests',
      'View requested role (Admin, Coach, Volunteer, Junior Sailor)',
      'Approve users to grant system access',
      'Approved user receives email confirmation',
      'User can immediately log in after approval',
      'Volunteers are auto-approved on registration',
    ],
    icon: 'user',
  },
  denyUser: {
    title: 'Deny User Registration',
    description: 'Production RigReport allows admins to reject registration requests.',
    productionFeatures: [
      'Reject pending user registration',
      'User receives email notification of denial',
      'Registration is permanently removed',
      'User can re-register with different details',
      'Requires admin role to perform',
    ],
    icon: 'delete',
  },
  changeUserRole: {
    title: 'Change User Role',
    description: 'Production RigReport allows admins to modify user permissions by changing roles.',
    productionFeatures: [
      'Change between: Administrator, Coach, Volunteer, Junior Sailor',
      'Each role has different permissions:',
      '• Admin: Full access, user management, all settings',
      '• Coach: Edit boats/equipment, manage maintenance, reports',
      '• Volunteer: View fleet, report damage, limited editing',
      '• Junior Sailor: View-only access to fleet information',
      'Cannot change your own role (prevents lockout)',
    ],
    icon: 'user',
  },
};
