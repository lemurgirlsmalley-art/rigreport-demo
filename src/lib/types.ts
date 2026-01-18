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

// Slip types for marina management
export type SlipStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'unavailable';
export type SlipType = 'standard' | 'large' | 'covered' | 'end-tie' | 't-head';
export type MemberAssignmentRole = 'primary' | 'secondary' | 'emergency';
export type PaymentMethod = 'check' | 'cash' | 'card' | 'transfer' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'refunded';
export type SlipReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Slip {
  id: string;
  slipNumber: string;
  displayName: string;
  dock: string;
  location?: string;
  slipType: SlipType;
  length?: string;
  width?: string;
  depth?: string;
  hasElectric: boolean;
  hasWater: boolean;
  status: SlipStatus;
  monthlyRate?: number;
  annualRate?: number;
  notes?: string;
  // Liability insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: string;
  liabilityCoverage?: number;
  insuranceNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlipMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlipMemberAssignment {
  id: string;
  slipId: string;
  memberId: string;
  role: MemberAssignmentRole;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface SlipBoat {
  id: string;
  slipId: string;
  boatName: string;
  boatType?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  length?: string;
  beam?: string;
  draft?: string;
  hullColor?: string;
  registrationNumber?: string;
  hin?: string;
  ownerName?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlipPayment {
  id: string;
  slipId: string;
  memberId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  periodStart?: string;
  periodEnd?: string;
  status: PaymentStatus;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface SlipReservation {
  id: string;
  slipId: string;
  startDate: string;
  endDate: string;
  reservedBy: string;
  email: string;
  phone?: string;
  boatInfo?: string;
  reason?: string;
  status: SlipReservationStatus;
  createdAt: string;
}
