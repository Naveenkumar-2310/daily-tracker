import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']).default('EXPENSE'),
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK', 'CARD']).default('UPI'),
  accountName: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  vehicleId: z.string().optional(),
  fuelLogId: z.string().optional(),
  medicineId: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export const UpdateExpenseSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']).optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK', 'CARD']).optional(),
  accountName: z.string().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export const CreateExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  icon: z.string().default('tag'),
  color: z.string().default('#4F46E5'),
});

export const SetMonthlyBudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  overallBudget: z.number().nonnegative('Budget must be positive or 0'),
  categoryBudgets: z.record(z.string(), z.number().nonnegative()).optional(),
});

