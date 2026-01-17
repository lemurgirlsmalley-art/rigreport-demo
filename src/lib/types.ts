// Role types for demo authentication
export type Role = 'admin' | 'coach' | 'volunteer' | 'junior_sailor';

// Boat status types
export type BoatStatus =
  | 'OK'
  | 'Needs inspection'
  | 'Needs repair'
  | 'Do not sail'
  | 'Out of service';

// Boat types available in the fleet
export type BoatType =
  | '420'
  | 'Club 420'
  | 'Open BIC'
  | 'Sunfish'
  | 'Coach Boat'
  | 'Safety Boat'
  | 'Skiff'
  | 'Pontoon'
  | 'RS Tera'
  | 'Hobie Wave'
  | 'Tracker'
  | 'Hunter 15'
  | 'RIB'
  | 'Zodiac'
  | 'Kayak'
  | 'Canoe'
  | 'Other';

// Organization types
export type Organization = 'EO' | 'YOH' | 'DSC';

// Maintenance related types
export type MaintenanceCategory =
  | 'Inspection'
  | 'Repair'
  | 'Rigging issue'
  | 'Hull damage'
  | 'Rigging check'
  | 'Inventory'
  | 'Other';

export type MaintenanceSeverity = 'Low' | 'Medium' | 'High';

export type MaintenanceStatus = 'Open' | 'In progress' | 'Resolved';

// Equipment types
export type EquipmentType =
  | 'Trailer'
  | 'Sail'
  | 'Rigging'
  | 'Dolly'
  | 'Motor'
  | 'Safety'
  | 'Other';

export type EquipmentStatus = 'OK' | 'Needs repair' | 'Out of service';

// Main interfaces
export interface Boat {
  id: string;
  displayName: string;
  hullNumber: string;
  type: BoatType;
  status: BoatStatus;
  organization: Organization;
  location: string;
  latitude?: number;
  longitude?: number;
  isRegattaPreferred: boolean;
  manufacturer?: string;
  model?: string;
  year?: number;
  color?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  lastInspection?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  organization: Organization;
  storageLocation: string;
  serialNumber?: string;
  assignedBoatId?: string;
  value?: number;
  lastInspection?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceEntry {
  id: string;
  boatId: string;
  equipmentId?: string;
  category: MaintenanceCategory;
  severity: MaintenanceSeverity;
  status: MaintenanceStatus;
  description: string;
  reportedBy: string;
  reportedAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: Organization;
}

export interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddBoats: boolean;
  canManageUsers: boolean;
  canChangeStatus: boolean;
  canViewAllOrganizations: boolean;
  canReportDamage: boolean;
  canResolveMaintenance: boolean;
}

export interface Reservation {
  id: string;
  boatId: string;
  startDate: string;
  endDate: string;
  reservedBy: string;
  email: string;
  reason?: string;
  createdAt: string;
}
