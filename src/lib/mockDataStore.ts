import type { Boat, Equipment, MaintenanceEntry, Reservation } from './types';
import { MOCK_BOATS, MOCK_EQUIPMENT, MOCK_MAINTENANCE } from './mockData';
import { generateId } from './utils';

const STORAGE_PREFIX = 'rigreport_demo_';
const DATA_VERSION = '4'; // Increment this to force a data reset

class MockDataStore {
  private boats: Boat[];
  private equipment: Equipment[];
  private maintenance: MaintenanceEntry[];
  private reservations: Reservation[];

  constructor() {
    // Check if we need to reset due to version change
    const storedVersion = localStorage.getItem(`${STORAGE_PREFIX}version`);
    if (storedVersion !== DATA_VERSION) {
      // Clear old data and use fresh mock data
      localStorage.removeItem(`${STORAGE_PREFIX}boats`);
      localStorage.removeItem(`${STORAGE_PREFIX}equipment`);
      localStorage.removeItem(`${STORAGE_PREFIX}maintenance`);
      localStorage.removeItem(`${STORAGE_PREFIX}reservations`);
      localStorage.setItem(`${STORAGE_PREFIX}version`, DATA_VERSION);
    }

    this.boats = this.load('boats') || [...MOCK_BOATS];
    this.equipment = this.load('equipment') || [...MOCK_EQUIPMENT];
    this.maintenance = this.load('maintenance') || [...MOCK_MAINTENANCE];
    this.reservations = this.load('reservations') || [];
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

  // Reset to initial state
  reset(): void {
    this.boats = [...MOCK_BOATS];
    this.equipment = [...MOCK_EQUIPMENT];
    this.maintenance = [...MOCK_MAINTENANCE];
    this.reservations = [];
    this.save('boats', this.boats);
    this.save('equipment', this.equipment);
    this.save('maintenance', this.maintenance);
    this.save('reservations', this.reservations);
  }

  // Clear all localStorage data
  clear(): void {
    localStorage.removeItem(`${STORAGE_PREFIX}boats`);
    localStorage.removeItem(`${STORAGE_PREFIX}equipment`);
    localStorage.removeItem(`${STORAGE_PREFIX}maintenance`);
    localStorage.removeItem(`${STORAGE_PREFIX}reservations`);
    this.boats = [...MOCK_BOATS];
    this.equipment = [...MOCK_EQUIPMENT];
    this.maintenance = [...MOCK_MAINTENANCE];
    this.reservations = [];
  }
}

export const mockStore = new MockDataStore();
