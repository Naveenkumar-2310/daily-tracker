export type ExpenseType = 'EXPENSE' | 'INCOME' | 'TRANSFER';
export type PaymentMode = 'CASH' | 'UPI' | 'BANK' | 'CARD';

export interface IExpenseCategory {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface IExpense {
  id: string;
  type: ExpenseType;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  paymentMode: PaymentMode;
  accountName?: string;
  notes?: string;
  receiptUrl?: string;
  vehicleId?: string;
  fuelLogId?: string;
  medicineId?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateExpenseDTO {
  type: ExpenseType;
  amount: number;
  categoryId: string;
  date: string;
  paymentMode?: PaymentMode;
  accountName?: string;
  notes?: string;
  receiptUrl?: string;
  vehicleId?: string;
  fuelLogId?: string;
  medicineId?: string;
  isRecurring?: boolean;
}

export interface IUpdateExpenseDTO {
  type?: ExpenseType;
  amount?: number;
  categoryId?: string;
  date?: string;
  paymentMode?: PaymentMode;
  accountName?: string;
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
}

export interface IMonthlyBudget {
  id: string;
  month: number; // 1-12
  year: number; // e.g. 2026
  overallBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> budgeted amount
  createdAt: string;
  updatedAt: string;
}

export interface ISetMonthlyBudgetDTO {
  month: number;
  year: number;
  overallBudget: number;
  categoryBudgets?: Record<string, number>;
}

export interface IExpenseSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRatePercentage: number;
  overallBudget: number;
  budgetSpentPercentage: number;
  remainingBudget: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
    budget?: number;
    isOverBudget?: boolean;
  }>;
  recentTransactions: IExpense[];
}

