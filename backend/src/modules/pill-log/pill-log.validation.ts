import { z } from 'zod';

export const MarkPillSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  status: z.enum(['TAKEN', 'MISSED', 'SKIPPED']),
  notes: z.string().optional(),
});

export const QueryMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be formatted as YYYY-MM (e.g. 2026-11)'),
  medicineId: z.string().optional(),
});

