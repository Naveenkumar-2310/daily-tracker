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
  expenseCategories: Array<{
    id: string;
    name: string;
    type: 'EXPENSE' | 'INCOME';
    icon: string;
    color: string;
    isDefault: boolean;
    createdAt: string;
  }>;
  expenses: Array<{
    id: string;
    type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
    amount: number;
    categoryId: string;
    categoryName: string;
    date: string;
    paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD';
    accountName?: string;
    notes?: string;
    receiptUrl?: string;
    vehicleId?: string;
    fuelLogId?: string;
    medicineId?: string;
    isRecurring?: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  monthlyBudgets: Array<{
    id: string;
    month: number;
    year: number;
    overallBudget: number;
    categoryBudgets: Record<string, number>;
    createdAt: string;
    updatedAt: string;
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
  expenseCategories: [
    { id: 'cat-fuel', name: 'Fuel & Transport', type: 'EXPENSE', icon: 'gas-station', color: '#D97706', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-med', name: 'Medicines & Health', type: 'EXPENSE', icon: 'pill', color: '#0D9488', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE', icon: 'silverware-fork-knife', color: '#F97316', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-grocery', name: 'Groceries', type: 'EXPENSE', icon: 'cart-outline', color: '#10B981', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-bills', name: 'Bills & Utilities', type: 'EXPENSE', icon: 'lightning-bolt', color: '#3B82F6', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-shopping', name: 'Shopping', type: 'EXPENSE', icon: 'shopping-outline', color: '#8B5CF6', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-entertainment', name: 'Entertainment', type: 'EXPENSE', icon: 'movie-play-outline', color: '#EC4899', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-other-exp', name: 'Other Expenses', type: 'EXPENSE', icon: 'dots-horizontal-circle', color: '#6B7280', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-salary', name: 'Salary', type: 'INCOME', icon: 'briefcase-outline', color: '#059669', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-freelance', name: 'Freelance & Projects', type: 'INCOME', icon: 'laptop', color: '#0284C7', isDefault: true, createdAt: new Date().toISOString() },
    { id: 'cat-other-inc', name: 'Other Income', type: 'INCOME', icon: 'cash-plus', color: '#6366F1', isDefault: true, createdAt: new Date().toISOString() },
  ],
  expenses: [],
  monthlyBudgets: [],
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
      const parsed = JSON.parse(raw);
      if (!parsed.expenseCategories || parsed.expenseCategories.length === 0) {
        parsed.expenseCategories = INITIAL_DATA.expenseCategories;
      }
      if (!parsed.expenses) {
        parsed.expenses = [];
      }
      if (!parsed.monthlyBudgets) {
        parsed.monthlyBudgets = [];
      }
      return parsed;
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

