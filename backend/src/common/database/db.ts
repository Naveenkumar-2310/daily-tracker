import fs from 'fs';
import path from 'path';

export interface DatabaseSchema {
  medicines: Array<{
    id: string;
    name: string;
    strength: string;
    dosageForm: string;
    scheduleSlot: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
    reminderTime: string;
    foodRelation: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD';
    currentStock: number;
    lowStockAlert: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  pillLogs: Array<{
    id: string;
    medicineId: string;
    medicineName: string;
    date: string; // YYYY-MM-DD
    status: 'TAKEN' | 'MISSED' | 'SKIPPED';
    takenAt: string;
    notes?: string;
  }>;
  vehicles: Array<{
    id: string;
    name: string;
    registrationNumber?: string;
    expectedMileage: number; // e.g. 55 km/L
    fuelTankCapacity?: number;
    initialOdometerKm: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  fuelLogs: Array<{
    id: string;
    vehicleId: string;
    vehicleName: string;
    date: string; // YYYY-MM-DD
    odometerKm: number;
    petrolAmount: number; // ₹
    fuelPricePerLitre?: number;
    litresFilled: number;
    distanceCovered?: number;
    actualMileage?: number;
    imageUrl?: string;
    notes?: string;
    createdAt: string;
  }>;
}

const DB_FILE = path.join(__dirname, '../../../data/db.json');

const INITIAL_DATA: DatabaseSchema = {
  medicines: [
    {
      id: 'med-leviphil-500',
      name: 'Leviphil 500',
      strength: '500 mg',
      dosageForm: 'Tablet',
      scheduleSlot: 'NIGHT',
      reminderTime: '21:30',
      foodRelation: 'AFTER_FOOD',
      currentStock: 30,
      lowStockAlert: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  pillLogs: [],
  vehicles: [
    {
      id: 'bike-commuter-55',
      name: 'My Daily Bike',
      registrationNumber: 'TN-01-BK-5500',
      expectedMileage: 55.0,
      fuelTankCapacity: 12,
      initialOdometerKm: 12500,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  fuelLogs: [],
};

export class JsonDatabase {
  private static instance: JsonDatabase;
  private data: DatabaseSchema;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): JsonDatabase {
    if (!JsonDatabase.instance) {
      JsonDatabase.instance = new JsonDatabase();
    }
    return JsonDatabase.instance;
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
        return INITIAL_DATA;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error loading database file, using initial data:', err);
      return INITIAL_DATA;
    }
  }

  public save(): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }
}

