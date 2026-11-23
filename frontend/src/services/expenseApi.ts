import { API_BASE_URL } from './api';

export interface IExpenseCategory {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface IExpenseItem {
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
  isRecurring?: boolean;
  createdAt: string;
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
  recentTransactions: IExpenseItem[];
}

export interface IMonthlyBudget {
  id?: string;
  month: number;
  year: number;
  overallBudget: number;
  categoryBudgets: Record<string, number>;
}

// In-memory fallback for offline/preview
let localExpenses: IExpenseItem[] = [];
let localCategories: IExpenseCategory[] = [
  { id: 'cat-fuel', name: 'Fuel & Transport', type: 'EXPENSE', icon: 'gas-station', color: '#D97706', isDefault: true },
  { id: 'cat-med', name: 'Medicines & Health', type: 'EXPENSE', icon: 'pill', color: '#0D9488', isDefault: true },
  { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE', icon: 'silverware-fork-knife', color: '#F97316', isDefault: true },
  { id: 'cat-grocery', name: 'Groceries', type: 'EXPENSE', icon: 'cart-outline', color: '#10B981', isDefault: true },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'EXPENSE', icon: 'lightning-bolt', color: '#3B82F6', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', type: 'EXPENSE', icon: 'shopping-outline', color: '#8B5CF6', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'EXPENSE', icon: 'movie-play-outline', color: '#EC4899', isDefault: true },
  { id: 'cat-other-exp', name: 'Other Expenses', type: 'EXPENSE', icon: 'dots-horizontal-circle', color: '#6B7280', isDefault: true },
  { id: 'cat-salary', name: 'Salary', type: 'INCOME', icon: 'briefcase-outline', color: '#059669', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance & Projects', type: 'INCOME', icon: 'laptop', color: '#0284C7', isDefault: true },
  { id: 'cat-other-inc', name: 'Other Income', type: 'INCOME', icon: 'cash-plus', color: '#6366F1', isDefault: true },
];
let localBudget: IMonthlyBudget = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  overallBudget: 25000,
  categoryBudgets: {},
};

export const expenseApi = {
  async getCategories(): Promise<IExpenseCategory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses/categories`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return localCategories;
  },

  async getExpenses(params: {
    month?: number;
    year?: number;
    type?: string;
    categoryId?: string;
    search?: string;
  } = {}): Promise<IExpenseItem[]> {
    try {
      const query = new URLSearchParams();
      if (params.month) query.set('month', String(params.month));
      if (params.year) query.set('year', String(params.year));
      if (params.type) query.set('type', params.type);
      if (params.categoryId) query.set('categoryId', params.categoryId);
      if (params.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE_URL}/api/v1/expenses?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    let list = [...localExpenses];
    if (params.month && params.year) {
      const prefix = `${params.year}-${String(params.month).padStart(2, '0')}`;
      list = list.filter((e) => e.date.startsWith(prefix));
    }
    if (params.type) {
      list = list.filter((e) => e.type === params.type);
    }
    return list;
  },

  async getSummary(month: number, year: number): Promise<IExpenseSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses/summary?month=${month}&year=${year}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback computed summary
    const list = localExpenses.filter((e) => e.date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: Record<string, number> = {};

    for (const item of list) {
      if (item.type === 'INCOME') totalIncome += item.amount;
      if (item.type === 'EXPENSE') {
        totalExpense += item.amount;
        catMap[item.categoryId] = (catMap[item.categoryId] || 0) + item.amount;
      }
    }

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const budgetSpent = localBudget.overallBudget > 0 ? (totalExpense / localBudget.overallBudget) * 100 : 0;

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePercentage: Number(savingsRate.toFixed(1)),
      overallBudget: localBudget.overallBudget,
      budgetSpentPercentage: Number(budgetSpent.toFixed(1)),
      remainingBudget: Math.max(0, localBudget.overallBudget - totalExpense),
      categoryBreakdown: Object.entries(catMap).map(([catId, spent]) => {
        const cat = localCategories.find((c) => c.id === catId);
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Category',
          icon: cat?.icon || 'tag',
          color: cat?.color || '#4F46E5',
          amount: spent,
          percentage: totalExpense > 0 ? Number(((spent / totalExpense) * 100).toFixed(1)) : 0,
        };
      }),
      recentTransactions: list.slice(0, 10),
    };
  },

  async createExpense(data: {
    type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
    amount: number;
    categoryId: string;
    date: string;
    paymentMode?: 'CASH' | 'UPI' | 'BANK' | 'CARD';
    accountName?: string;
    notes?: string;
    receiptUrl?: string;
    isRecurring?: boolean;
  }): Promise<IExpenseItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const cat = localCategories.find((c) => c.id === data.categoryId);
    const newExp: IExpenseItem = {
      id: `exp-${Date.now()}`,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      categoryName: cat ? cat.name : 'General',
      date: data.date,
      paymentMode: data.paymentMode || 'UPI',
      accountName: data.accountName,
      notes: data.notes,
      receiptUrl: data.receiptUrl,
      isRecurring: data.isRecurring,
      createdAt: new Date().toISOString(),
    };
    localExpenses.unshift(newExp);
    return newExp;
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {}

    localExpenses = localExpenses.filter((e) => e.id !== id);
    return true;
  },

  async getBudget(month: number, year: number): Promise<IMonthlyBudget> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses/budget?month=${month}&year=${year}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return localBudget;
  },

  async setBudget(data: {
    month: number;
    year: number;
    overallBudget: number;
    categoryBudgets?: Record<string, number>;
  }): Promise<IMonthlyBudget> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expenses/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    localBudget = {
      month: data.month,
      year: data.year,
      overallBudget: data.overallBudget,
      categoryBudgets: data.categoryBudgets || {},
    };
    return localBudget;
  },
};

