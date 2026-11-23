import { JsonDatabase } from '../../common/database/db';
import { getMysqlPool } from '../../common/database/mysql';
import {
  IExpense,
  IExpenseCategory,
  IMonthlyBudget,
  ExpenseType,
  ISetMonthlyBudgetDTO,
} from './expense.interface';
import { v4 as uuidv4 } from 'uuid';

export class ExpenseRepository {
  private db = JsonDatabase.getInstance();

  // ==================== CATEGORIES ====================
  public async findAllCategories(): Promise<IExpenseCategory[]> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT * FROM expense_categories ORDER BY name ASC');
      return rows;
    }
    return this.db.getData().expenseCategories || [];
  }

  public async findCategoryById(id: string): Promise<IExpenseCategory | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT * FROM expense_categories WHERE id = ?', [id]);
      return rows[0] || null;
    }
    const cat = this.db.getData().expenseCategories?.find((c) => c.id === id);
    return cat || null;
  }

  public async createCategory(cat: Omit<IExpenseCategory, 'id' | 'createdAt'>): Promise<IExpenseCategory> {
    const newCat: IExpenseCategory = {
      ...cat,
      id: `cat-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        'INSERT INTO expense_categories (id, name, type, icon, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newCat.id, newCat.name, newCat.type, newCat.icon, newCat.color, newCat.isDefault, newCat.createdAt]
      );
      return newCat;
    }

    if (!this.db.getData().expenseCategories) {
      this.db.getData().expenseCategories = [];
    }
    this.db.getData().expenseCategories.push(newCat);
    this.db.save();
    return newCat;
  }

  // ==================== EXPENSES ====================
  public async findAll(filters: {
    month?: number;
    year?: number;
    type?: ExpenseType;
    categoryId?: string;
    search?: string;
  } = {}): Promise<IExpense[]> {
    const pool = getMysqlPool();
    if (pool) {
      let sql = 'SELECT * FROM expenses WHERE 1=1';
      const params: any[] = [];

      if (filters.year && filters.month) {
        const monthStr = String(filters.month).padStart(2, '0');
        sql += ' AND date LIKE ?';
        params.push(`${filters.year}-${monthStr}%`);
      } else if (filters.year) {
        sql += ' AND date LIKE ?';
        params.push(`${filters.year}-%`);
      }

      if (filters.type) {
        sql += ' AND type = ?';
        params.push(filters.type);
      }

      if (filters.categoryId) {
        sql += ' AND categoryId = ?';
        params.push(filters.categoryId);
      }

      if (filters.search) {
        sql += ' AND (categoryName LIKE ? OR notes LIKE ? OR accountName LIKE ?)';
        const queryTerm = `%${filters.search}%`;
        params.push(queryTerm, queryTerm, queryTerm);
      }

      sql += ' ORDER BY date DESC, createdAt DESC';
      const [rows]: any = await pool.query(sql, params);
      return rows;
    }

    let list = this.db.getData().expenses || [];

    if (filters.year && filters.month) {
      const monthPrefix = `${filters.year}-${String(filters.month).padStart(2, '0')}`;
      list = list.filter((e) => e.date.startsWith(monthPrefix));
    } else if (filters.year) {
      list = list.filter((e) => e.date.startsWith(`${filters.year}-`));
    }

    if (filters.type) {
      list = list.filter((e) => e.type === filters.type);
    }

    if (filters.categoryId) {
      list = list.filter((e) => e.categoryId === filters.categoryId);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.categoryName.toLowerCase().includes(s) ||
          e.notes?.toLowerCase().includes(s) ||
          e.accountName?.toLowerCase().includes(s)
      );
    }

    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async findById(id: string): Promise<IExpense | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
      return rows[0] || null;
    }
    const item = this.db.getData().expenses?.find((e) => e.id === id);
    return item || null;
  }

  public async findByFuelLogId(fuelLogId: string): Promise<IExpense | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT * FROM expenses WHERE fuelLogId = ?', [fuelLogId]);
      return rows[0] || null;
    }
    const item = this.db.getData().expenses?.find((e) => e.fuelLogId === fuelLogId);
    return item || null;
  }

  public async create(data: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<IExpense> {
    const now = new Date().toISOString();
    const newExpense: IExpense = {
      ...data,
      id: `exp-${uuidv4()}`,
      createdAt: now,
      updatedAt: now,
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        `INSERT INTO expenses (id, type, amount, categoryId, categoryName, date, paymentMode, accountName, notes, receiptUrl, vehicleId, fuelLogId, medicineId, isRecurring, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newExpense.id,
          newExpense.type,
          newExpense.amount,
          newExpense.categoryId,
          newExpense.categoryName,
          newExpense.date,
          newExpense.paymentMode,
          newExpense.accountName || null,
          newExpense.notes || null,
          newExpense.receiptUrl || null,
          newExpense.vehicleId || null,
          newExpense.fuelLogId || null,
          newExpense.medicineId || null,
          newExpense.isRecurring ? 1 : 0,
          newExpense.createdAt,
          newExpense.updatedAt,
        ]
      );
      return newExpense;
    }

    if (!this.db.getData().expenses) {
      this.db.getData().expenses = [];
    }
    this.db.getData().expenses.push(newExpense);
    this.db.save();
    return newExpense;
  }

  public async update(id: string, partial: Partial<IExpense>): Promise<IExpense | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: IExpense = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        `UPDATE expenses SET type = ?, amount = ?, categoryId = ?, categoryName = ?, date = ?, paymentMode = ?, accountName = ?, notes = ?, receiptUrl = ?, isRecurring = ?, updatedAt = ?
         WHERE id = ?`,
        [
          updated.type,
          updated.amount,
          updated.categoryId,
          updated.categoryName,
          updated.date,
          updated.paymentMode,
          updated.accountName || null,
          updated.notes || null,
          updated.receiptUrl || null,
          updated.isRecurring ? 1 : 0,
          updated.updatedAt,
          id,
        ]
      );
      return updated;
    }

    const idx = this.db.getData().expenses?.findIndex((e) => e.id === id) ?? -1;
    if (idx !== -1) {
      this.db.getData().expenses[idx] = updated;
      this.db.save();
    }
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const initialLen = this.db.getData().expenses?.length || 0;
    this.db.getData().expenses = (this.db.getData().expenses || []).filter((e) => e.id !== id);
    this.db.save();
    return this.db.getData().expenses.length < initialLen;
  }

  public async deleteByFuelLogId(fuelLogId: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query('DELETE FROM expenses WHERE fuelLogId = ?', [fuelLogId]);
      return res.affectedRows > 0;
    }

    const initialLen = this.db.getData().expenses?.length || 0;
    this.db.getData().expenses = (this.db.getData().expenses || []).filter((e) => e.fuelLogId !== fuelLogId);
    this.db.save();
    return this.db.getData().expenses.length < initialLen;
  }

  // ==================== BUDGETS ====================
  public async getMonthlyBudget(month: number, year: number): Promise<IMonthlyBudget | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query(
        'SELECT * FROM monthly_budgets WHERE month = ? AND year = ?',
        [month, year]
      );
      if (rows[0]) {
        let catBudgets = {};
        try {
          catBudgets = JSON.parse(rows[0].categoryBudgetsJson || '{}');
        } catch {}
        return {
          id: rows[0].id,
          month: rows[0].month,
          year: rows[0].year,
          overallBudget: rows[0].overallBudget,
          categoryBudgets: catBudgets,
          createdAt: rows[0].createdAt,
          updatedAt: rows[0].updatedAt,
        };
      }
      return null;
    }

    const b = this.db.getData().monthlyBudgets?.find((b) => b.month === month && b.year === year);
    return b || null;
  }

  public async setMonthlyBudget(dto: ISetMonthlyBudgetDTO): Promise<IMonthlyBudget> {
    const existing = await this.getMonthlyBudget(dto.month, dto.year);
    const now = new Date().toISOString();

    if (existing) {
      const updated: IMonthlyBudget = {
        ...existing,
        overallBudget: dto.overallBudget,
        categoryBudgets: dto.categoryBudgets || existing.categoryBudgets || {},
        updatedAt: now,
      };

      const pool = getMysqlPool();
      if (pool) {
        await pool.query(
          'UPDATE monthly_budgets SET overallBudget = ?, categoryBudgetsJson = ?, updatedAt = ? WHERE id = ?',
          [updated.overallBudget, JSON.stringify(updated.categoryBudgets), updated.updatedAt, updated.id]
        );
        return updated;
      }

      const idx = this.db.getData().monthlyBudgets?.findIndex((b) => b.id === existing.id) ?? -1;
      if (idx !== -1) {
        this.db.getData().monthlyBudgets[idx] = updated;
        this.db.save();
      }
      return updated;
    }

    const newBudget: IMonthlyBudget = {
      id: `bgt-${uuidv4()}`,
      month: dto.month,
      year: dto.year,
      overallBudget: dto.overallBudget,
      categoryBudgets: dto.categoryBudgets || {},
      createdAt: now,
      updatedAt: now,
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        'INSERT INTO monthly_budgets (id, month, year, overallBudget, categoryBudgetsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newBudget.id,
          newBudget.month,
          newBudget.year,
          newBudget.overallBudget,
          JSON.stringify(newBudget.categoryBudgets),
          newBudget.createdAt,
          newBudget.updatedAt,
        ]
      );
      return newBudget;
    }

    if (!this.db.getData().monthlyBudgets) {
      this.db.getData().monthlyBudgets = [];
    }
    this.db.getData().monthlyBudgets.push(newBudget);
    this.db.save();
    return newBudget;
  }
}

