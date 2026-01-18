import type {
  Boat, Equipment, MaintenanceEntry, Reservation,
  Slip, SlipMember, SlipMemberAssignment, SlipBoatAssignment, SlipPayment, SlipReservation
} from './types';
import { MOCK_BOATS, MOCK_EQUIPMENT, MOCK_MAINTENANCE, MOCK_SLIPS, MOCK_SLIP_MEMBERS } from './mockData';
import { generateId } from './utils';

const STORAGE_PREFIX = 'rigreport_demo_';
const DATA_VERSION = '5'; // Increment this to force a data reset

class MockDataStore {
  private boats: Boat[];
  private equipment: Equipment[];
  private maintenance: MaintenanceEntry[];
  private reservations: Reservation[];
  private slips: Slip[];
  private slipMembers: SlipMember[];
  private slipMemberAssignments: SlipMemberAssignment[];
  private slipBoatAssignments: SlipBoatAssignment[];
  private slipPayments: SlipPayment[];
  private slipReservations: SlipReservation[];

  constructor() {
    // Check if we need to reset due to version change
    const storedVersion = localStorage.getItem(`${STORAGE_PREFIX}version`);
    if (storedVersion !== DATA_VERSION) {
      // Clear old data and use fresh mock data
      localStorage.removeItem(`${STORAGE_PREFIX}boats`);
      localStorage.removeItem(`${STORAGE_PREFIX}equipment`);
      localStorage.removeItem(`${STORAGE_PREFIX}maintenance`);
      localStorage.removeItem(`${STORAGE_PREFIX}reservations`);
      localStorage.removeItem(`${STORAGE_PREFIX}slips`);
      localStorage.removeItem(`${STORAGE_PREFIX}slipMembers`);
      localStorage.removeItem(`${STORAGE_PREFIX}slipMemberAssignments`);
      localStorage.removeItem(`${STORAGE_PREFIX}slipBoatAssignments`);
      localStorage.removeItem(`${STORAGE_PREFIX}slipPayments`);
      localStorage.removeItem(`${STORAGE_PREFIX}slipReservations`);
      localStorage.setItem(`${STORAGE_PREFIX}version`, DATA_VERSION);
    }

    this.boats = this.load('boats') || [...MOCK_BOATS];
    this.equipment = this.load('equipment') || [...MOCK_EQUIPMENT];
    this.maintenance = this.load('maintenance') || [...MOCK_MAINTENANCE];
    this.reservations = this.load('reservations') || [];
    this.slips = this.load('slips') || [...MOCK_SLIPS];
    this.slipMembers = this.load('slipMembers') || [...MOCK_SLIP_MEMBERS];
    this.slipMemberAssignments = this.load('slipMemberAssignments') || [];
    this.slipBoatAssignments = this.load('slipBoatAssignments') || [];
    this.slipPayments = this.load('slipPayments') || [];
    this.slipReservations = this.load('slipReservations') || [];
  }

  // Simulate network delay
  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
  }

  // LocalStorage helpers
  private load<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private save(key: string, data: unknown): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Boat CRUD operations
  async getBoats(): Promise<Boat[]> {
    await this.simulateDelay();
    return [...this.boats];
  }

  async getBoat(id: string): Promise<Boat | undefined> {
    await this.simulateDelay();
    return this.boats.find((b) => b.id === id);
  }

  async createBoat(data: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Boat> {
    await this.simulateDelay();
    const now = new Date().toISOString();
    const boat: Boat = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.boats = [...this.boats, boat];
    this.save('boats', this.boats);
    return boat;
  }

  async updateBoat(id: string, updates: Partial<Boat>): Promise<Boat> {
    await this.simulateDelay();
    const index = this.boats.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Boat with id ${id} not found`);
    }
    const updatedBoat: Boat = {
      ...this.boats[index],
      ...updates,
      id, // Prevent id from being changed
      updatedAt: new Date().toISOString(),
    };
    this.boats = this.boats.map((b) => (b.id === id ? updatedBoat : b));
    this.save('boats', this.boats);
    return updatedBoat;
  }

  async deleteBoat(id: string): Promise<void> {
    await this.simulateDelay();
    this.boats = this.boats.filter((b) => b.id !== id);
    this.save('boats', this.boats);
    // Also delete related maintenance entries
    this.maintenance = this.maintenance.filter((m) => m.boatId !== id);
    this.save('maintenance', this.maintenance);
  }

  // Equipment CRUD operations
  async getEquipment(): Promise<Equipment[]> {
    await this.simulateDelay();
    return [...this.equipment];
  }

  async getEquipmentItem(id: string): Promise<Equipment | undefined> {
    await this.simulateDelay();
    return this.equipment.find((e) => e.id === id);
  }

  async createEquipment(data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    await this.simulateDelay();
    const now = new Date().toISOString();
    const item: Equipment = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.equipment = [...this.equipment, item];
    this.save('equipment', this.equipment);
    return item;
  }

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
    await this.simulateDelay();
    const index = this.equipment.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Equipment with id ${id} not found`);
    }
    const updatedItem: Equipment = {
      ...this.equipment[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.equipment = this.equipment.map((e) => (e.id === id ? updatedItem : e));
    this.save('equipment', this.equipment);
    return updatedItem;
  }

  async deleteEquipment(id: string): Promise<void> {
    await this.simulateDelay();
    this.equipment = this.equipment.filter((e) => e.id !== id);
    this.save('equipment', this.equipment);
  }

  // Maintenance CRUD operations
  async getMaintenance(boatId?: string): Promise<MaintenanceEntry[]> {
    await this.simulateDelay();
    if (boatId) {
      return this.maintenance.filter((m) => m.boatId === boatId);
    }
    return [...this.maintenance];
  }

  async getMaintenanceEntry(id: string): Promise<MaintenanceEntry | undefined> {
    await this.simulateDelay();
    return this.maintenance.find((m) => m.id === id);
  }

  async createMaintenance(
    data: Omit<MaintenanceEntry, 'id' | 'reportedAt'>
  ): Promise<MaintenanceEntry> {
    await this.simulateDelay();
    const entry: MaintenanceEntry = {
      ...data,
      id: generateId(),
      reportedAt: new Date().toISOString(),
    };
    this.maintenance = [...this.maintenance, entry];
    this.save('maintenance', this.maintenance);
    return entry;
  }

  async updateMaintenance(
    id: string,
    updates: Partial<MaintenanceEntry>
  ): Promise<MaintenanceEntry> {
    await this.simulateDelay();
    const index = this.maintenance.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Maintenance entry with id ${id} not found`);
    }
    const updatedEntry: MaintenanceEntry = {
      ...this.maintenance[index],
      ...updates,
      id,
    };
    this.maintenance = this.maintenance.map((m) => (m.id === id ? updatedEntry : m));
    this.save('maintenance', this.maintenance);
    return updatedEntry;
  }

  // Reservation CRUD operations
  async getReservations(boatId?: string): Promise<Reservation[]> {
    await this.simulateDelay();
    if (boatId) {
      return this.reservations.filter((r) => r.boatId === boatId);
    }
    return [...this.reservations];
  }

  async getReservation(id: string): Promise<Reservation | undefined> {
    await this.simulateDelay();
    return this.reservations.find((r) => r.id === id);
  }

  async createReservation(
    data: Omit<Reservation, 'id' | 'createdAt'>
  ): Promise<Reservation> {
    await this.simulateDelay();
    const reservation: Reservation = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.reservations = [...this.reservations, reservation];
    this.save('reservations', this.reservations);
    return reservation;
  }

  async deleteReservation(id: string): Promise<void> {
    await this.simulateDelay();
    this.reservations = this.reservations.filter((r) => r.id !== id);
    this.save('reservations', this.reservations);
  }

  // Slip CRUD operations
  async getSlips(): Promise<Slip[]> {
    await this.simulateDelay();
    return [...this.slips];
  }

  async getSlip(id: string): Promise<Slip | undefined> {
    await this.simulateDelay();
    return this.slips.find((s) => s.id === id);
  }

  async createSlip(data: Omit<Slip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Slip> {
    await this.simulateDelay();
    const now = new Date().toISOString();
    const slip: Slip = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.slips = [...this.slips, slip];
    this.save('slips', this.slips);
    return slip;
  }

  async updateSlip(id: string, updates: Partial<Slip>): Promise<Slip> {
    await this.simulateDelay();
    const index = this.slips.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Slip with id ${id} not found`);
    }
    const updatedSlip: Slip = {
      ...this.slips[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.slips = this.slips.map((s) => (s.id === id ? updatedSlip : s));
    this.save('slips', this.slips);
    return updatedSlip;
  }

  async deleteSlip(id: string): Promise<void> {
    await this.simulateDelay();
    this.slips = this.slips.filter((s) => s.id !== id);
    this.save('slips', this.slips);
    // Also delete related data
    this.slipMemberAssignments = this.slipMemberAssignments.filter((a) => a.slipId !== id);
    this.slipBoatAssignments = this.slipBoatAssignments.filter((a) => a.slipId !== id);
    this.slipPayments = this.slipPayments.filter((p) => p.slipId !== id);
    this.slipReservations = this.slipReservations.filter((r) => r.slipId !== id);
    this.save('slipMemberAssignments', this.slipMemberAssignments);
    this.save('slipBoatAssignments', this.slipBoatAssignments);
    this.save('slipPayments', this.slipPayments);
    this.save('slipReservations', this.slipReservations);
  }

  // Slip Member CRUD operations
  async getSlipMembers(): Promise<SlipMember[]> {
    await this.simulateDelay();
    return [...this.slipMembers];
  }

  async getSlipMember(id: string): Promise<SlipMember | undefined> {
    await this.simulateDelay();
    return this.slipMembers.find((m) => m.id === id);
  }

  async createSlipMember(data: Omit<SlipMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<SlipMember> {
    await this.simulateDelay();
    const now = new Date().toISOString();
    const member: SlipMember = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.slipMembers = [...this.slipMembers, member];
    this.save('slipMembers', this.slipMembers);
    return member;
  }

  async updateSlipMember(id: string, updates: Partial<SlipMember>): Promise<SlipMember> {
    await this.simulateDelay();
    const index = this.slipMembers.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Slip member with id ${id} not found`);
    }
    const updatedMember: SlipMember = {
      ...this.slipMembers[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.slipMembers = this.slipMembers.map((m) => (m.id === id ? updatedMember : m));
    this.save('slipMembers', this.slipMembers);
    return updatedMember;
  }

  async deleteSlipMember(id: string): Promise<void> {
    await this.simulateDelay();
    this.slipMembers = this.slipMembers.filter((m) => m.id !== id);
    this.save('slipMembers', this.slipMembers);
  }

  // Slip Member Assignment CRUD operations
  async getSlipMemberAssignments(slipId?: string): Promise<SlipMemberAssignment[]> {
    await this.simulateDelay();
    if (slipId) {
      return this.slipMemberAssignments.filter((a) => a.slipId === slipId);
    }
    return [...this.slipMemberAssignments];
  }

  async createSlipMemberAssignment(
    data: Omit<SlipMemberAssignment, 'id' | 'createdAt'>
  ): Promise<SlipMemberAssignment> {
    await this.simulateDelay();
    const assignment: SlipMemberAssignment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.slipMemberAssignments = [...this.slipMemberAssignments, assignment];
    this.save('slipMemberAssignments', this.slipMemberAssignments);
    return assignment;
  }

  async deleteSlipMemberAssignment(id: string): Promise<void> {
    await this.simulateDelay();
    this.slipMemberAssignments = this.slipMemberAssignments.filter((a) => a.id !== id);
    this.save('slipMemberAssignments', this.slipMemberAssignments);
  }

  // Slip Boat Assignment CRUD operations
  async getSlipBoatAssignments(slipId?: string): Promise<SlipBoatAssignment[]> {
    await this.simulateDelay();
    if (slipId) {
      return this.slipBoatAssignments.filter((a) => a.slipId === slipId);
    }
    return [...this.slipBoatAssignments];
  }

  async createSlipBoatAssignment(
    data: Omit<SlipBoatAssignment, 'id' | 'assignedAt'>
  ): Promise<SlipBoatAssignment> {
    await this.simulateDelay();
    const assignment: SlipBoatAssignment = {
      ...data,
      id: generateId(),
      assignedAt: new Date().toISOString(),
    };
    this.slipBoatAssignments = [...this.slipBoatAssignments, assignment];
    this.save('slipBoatAssignments', this.slipBoatAssignments);
    return assignment;
  }

  async deleteSlipBoatAssignment(id: string): Promise<void> {
    await this.simulateDelay();
    this.slipBoatAssignments = this.slipBoatAssignments.filter((a) => a.id !== id);
    this.save('slipBoatAssignments', this.slipBoatAssignments);
  }

  // Slip Payment CRUD operations
  async getSlipPayments(slipId?: string): Promise<SlipPayment[]> {
    await this.simulateDelay();
    if (slipId) {
      return this.slipPayments.filter((p) => p.slipId === slipId);
    }
    return [...this.slipPayments];
  }

  async createSlipPayment(data: Omit<SlipPayment, 'id' | 'createdAt'>): Promise<SlipPayment> {
    await this.simulateDelay();
    const payment: SlipPayment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.slipPayments = [...this.slipPayments, payment];
    this.save('slipPayments', this.slipPayments);
    return payment;
  }

  async deleteSlipPayment(id: string): Promise<void> {
    await this.simulateDelay();
    this.slipPayments = this.slipPayments.filter((p) => p.id !== id);
    this.save('slipPayments', this.slipPayments);
  }

  // Slip Reservation CRUD operations
  async getSlipReservations(slipId?: string): Promise<SlipReservation[]> {
    await this.simulateDelay();
    if (slipId) {
      return this.slipReservations.filter((r) => r.slipId === slipId);
    }
    return [...this.slipReservations];
  }

  async createSlipReservation(
    data: Omit<SlipReservation, 'id' | 'createdAt'>
  ): Promise<SlipReservation> {
    await this.simulateDelay();
    const reservation: SlipReservation = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.slipReservations = [...this.slipReservations, reservation];
    this.save('slipReservations', this.slipReservations);
    return reservation;
  }

  async deleteSlipReservation(id: string): Promise<void> {
    await this.simulateDelay();
    this.slipReservations = this.slipReservations.filter((r) => r.id !== id);
    this.save('slipReservations', this.slipReservations);
  }

  // Reset to initial state
  reset(): void {
    this.boats = [...MOCK_BOATS];
    this.equipment = [...MOCK_EQUIPMENT];
    this.maintenance = [...MOCK_MAINTENANCE];
    this.reservations = [];
    this.slips = [...MOCK_SLIPS];
    this.slipMembers = [...MOCK_SLIP_MEMBERS];
    this.slipMemberAssignments = [];
    this.slipBoatAssignments = [];
    this.slipPayments = [];
    this.slipReservations = [];
    this.save('boats', this.boats);
    this.save('equipment', this.equipment);
    this.save('maintenance', this.maintenance);
    this.save('reservations', this.reservations);
    this.save('slips', this.slips);
    this.save('slipMembers', this.slipMembers);
    this.save('slipMemberAssignments', this.slipMemberAssignments);
    this.save('slipBoatAssignments', this.slipBoatAssignments);
    this.save('slipPayments', this.slipPayments);
    this.save('slipReservations', this.slipReservations);
  }

  // Clear all localStorage data
  clear(): void {
    localStorage.removeItem(`${STORAGE_PREFIX}boats`);
    localStorage.removeItem(`${STORAGE_PREFIX}equipment`);
    localStorage.removeItem(`${STORAGE_PREFIX}maintenance`);
    localStorage.removeItem(`${STORAGE_PREFIX}reservations`);
    localStorage.removeItem(`${STORAGE_PREFIX}slips`);
    localStorage.removeItem(`${STORAGE_PREFIX}slipMembers`);
    localStorage.removeItem(`${STORAGE_PREFIX}slipMemberAssignments`);
    localStorage.removeItem(`${STORAGE_PREFIX}slipBoatAssignments`);
    localStorage.removeItem(`${STORAGE_PREFIX}slipPayments`);
    localStorage.removeItem(`${STORAGE_PREFIX}slipReservations`);
    this.boats = [...MOCK_BOATS];
    this.equipment = [...MOCK_EQUIPMENT];
    this.maintenance = [...MOCK_MAINTENANCE];
    this.reservations = [];
    this.slips = [...MOCK_SLIPS];
    this.slipMembers = [...MOCK_SLIP_MEMBERS];
    this.slipMemberAssignments = [];
    this.slipBoatAssignments = [];
    this.slipPayments = [];
    this.slipReservations = [];
  }
}

export const mockStore = new MockDataStore();
