import { ExpenseRepository } from './expense.repository';
import {
  ICreateExpenseDTO,
  IUpdateExpenseDTO,
  IExpense,
  IExpenseCategory,
  IExpenseSummary,
  IMonthlyBudget,
  ISetMonthlyBudgetDTO,
} from './expense.interface';

export class ExpenseService {
  constructor(private repo: ExpenseRepository = new ExpenseRepository()) {}

  public async getCategories(): Promise<IExpenseCategory[]> {
    return this.repo.findAllCategories();
  }

  public async createCategory(dto: { name: string; type: 'EXPENSE' | 'INCOME'; icon?: string; color?: string }): Promise<IExpenseCategory> {
    return this.repo.createCategory({
      name: dto.name,
      type: dto.type,
      icon: dto.icon || 'tag',
      color: dto.color || '#4F46E5',
      isDefault: false,
    });
  }

  public async createExpense(dto: ICreateExpenseDTO): Promise<IExpense> {
    const category = await this.repo.findCategoryById(dto.categoryId);
    const categoryName = category ? category.name : 'Uncategorized';

    return this.repo.create({
      type: dto.type || 'EXPENSE',
      amount: Number(dto.amount),
      categoryId: dto.categoryId,
      categoryName,
      date: dto.date,
      paymentMode: dto.paymentMode || 'UPI',
      accountName: dto.accountName,
      notes: dto.notes,
      receiptUrl: dto.receiptUrl,
      vehicleId: dto.vehicleId,
      fuelLogId: dto.fuelLogId,
      medicineId: dto.medicineId,
      isRecurring: dto.isRecurring || false,
    });
  }

  public async updateExpense(id: string, dto: IUpdateExpenseDTO): Promise<IExpense> {
    let categoryName: string | undefined;
    if (dto.categoryId) {
      const category = await this.repo.findCategoryById(dto.categoryId);
      if (category) {
        categoryName = category.name;
      }
    }

    const updated = await this.repo.update(id, {
      ...dto,
      ...(categoryName ? { categoryName } : {}),
      ...(dto.amount !== undefined ? { amount: Number(dto.amount) } : {}),
    });

    if (!updated) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return updated;
  }

  public async deleteExpense(id: string): Promise<boolean> {
    const success = await this.repo.delete(id);
    if (!success) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return true;
  }

  public async getExpenses(filters: {
    month?: number;
    year?: number;
    type?: any;
    categoryId?: string;
    search?: string;
  }): Promise<IExpense[]> {
    return this.repo.findAll(filters);
  }

  public async getSummary(month: number, year: number): Promise<IExpenseSummary> {
    const allExpenses = await this.repo.findAll({ month, year });
    const categories = await this.repo.findAllCategories();
    const budget = await this.repo.getMonthlyBudget(month, year);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    for (const item of allExpenses) {
      if (item.type === 'INCOME') {
        totalIncome += item.amount;
      } else if (item.type === 'EXPENSE') {
        totalExpense += item.amount;
        categoryTotals[item.categoryId] = (categoryTotals[item.categoryId] || 0) + item.amount;
      }
    }

    totalIncome = Number(totalIncome.toFixed(2));
    totalExpense = Number(totalExpense.toFixed(2));
    const netSavings = Number((totalIncome - totalExpense).toFixed(2));
    const savingsRatePercentage = totalIncome > 0
      ? Number(Math.max(0, (netSavings / totalIncome) * 100).toFixed(1))
      : 0;

    const overallBudget = budget?.overallBudget || 0;
    const remainingBudget = Number(Math.max(0, overallBudget - totalExpense).toFixed(2));
    const budgetSpentPercentage = overallBudget > 0
      ? Number(Math.min(999, (totalExpense / overallBudget) * 100).toFixed(1))
      : 0;

    // Category breakdown
    const categoryMap = new Map<string, IExpenseCategory>();
    for (const cat of categories) {
      categoryMap.set(cat.id, cat);
    }

    const categoryBreakdown = Object.entries(categoryTotals).map(([catId, spent]) => {
      const cat = categoryMap.get(catId);
      const catBudget = budget?.categoryBudgets?.[catId];
      const percentage = totalExpense > 0 ? Number(((spent / totalExpense) * 100).toFixed(1)) : 0;
      return {
        categoryId: catId,
        categoryName: cat?.name || 'Uncategorized',
        icon: cat?.icon || 'tag',
        color: cat?.color || '#4F46E5',
        amount: Number(spent.toFixed(2)),
        percentage,
        budget: catBudget,
        isOverBudget: catBudget ? spent > catBudget : false,
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePercentage,
      overallBudget,
      budgetSpentPercentage,
      remainingBudget,
      categoryBreakdown,
      recentTransactions: allExpenses.slice(0, 10),
    };
  }

  public async getBudget(month: number, year: number): Promise<IMonthlyBudget | null> {
    return this.repo.getMonthlyBudget(month, year);
  }

  public async setBudget(dto: ISetMonthlyBudgetDTO): Promise<IMonthlyBudget> {
    return this.repo.setMonthlyBudget(dto);
  }

  // Cross-module Fuel Sync
  public async syncFuelLog(fuelLog: {
    id: string;
    vehicleId: string;
    vehicleName: string;
    date: string;
    petrolAmount: number;
    notes?: string;
  }): Promise<IExpense> {
    // Check if expense already exists for this fuel log
    const existing = await this.repo.findByFuelLogId(fuelLog.id);
    if (existing) {
      return this.repo.update(existing.id, {
        amount: fuelLog.petrolAmount,
        date: fuelLog.date,
        notes: fuelLog.notes || `Fuel refill for ${fuelLog.vehicleName}`,
      }) as Promise<IExpense>;
    }

    // Find cat-fuel or default
    const categories = await this.repo.findAllCategories();
    const fuelCat = categories.find((c) => c.id === 'cat-fuel' || c.name.toLowerCase().includes('fuel'));
    const categoryId = fuelCat ? fuelCat.id : 'cat-fuel';
    const categoryName = fuelCat ? fuelCat.name : 'Fuel & Transport';

    return this.repo.create({
      type: 'EXPENSE',
      amount: fuelLog.petrolAmount,
      categoryId,
      categoryName,
      date: fuelLog.date,
      paymentMode: 'UPI',
      notes: fuelLog.notes ? `${fuelLog.vehicleName}: ${fuelLog.notes}` : `Fuel refill for ${fuelLog.vehicleName}`,
      vehicleId: fuelLog.vehicleId,
      fuelLogId: fuelLog.id,
      isRecurring: false,
    });
  }

  public async deleteFuelLogExpense(fuelLogId: string): Promise<boolean> {
    return this.repo.deleteByFuelLogId(fuelLogId);
  }
}

