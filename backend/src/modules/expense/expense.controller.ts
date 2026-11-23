import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service';

export class ExpenseController {
  constructor(private service: ExpenseService = new ExpenseService()) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = req.query.month ? Number(req.query.month) : undefined;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const type = req.query.type as any;
      const categoryId = req.query.categoryId as string | undefined;
      const search = req.query.search as string | undefined;

      const expenses = await this.service.getExpenses({ month, year, type, categoryId, search });
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const expenses = await this.service.getExpenses({});
      const found = expenses.find((e) => e.id === id);
      if (!found) {
        res.status(404).json({ error: `Expense with id ${id} not found` });
        return;
      }
      res.json(found);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.service.createExpense(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.service.updateExpense(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteExpense(id);
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };

  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();

      const summary = await this.service.getSummary(month, year);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  public getBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();

      const budget = await this.service.getBudget(month, year);
      res.json(budget || { month, year, overallBudget: 0, categoryBudgets: {} });
    } catch (error) {
      next(error);
    }
  };

  public setBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await this.service.setBudget(req.body);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  };
}

