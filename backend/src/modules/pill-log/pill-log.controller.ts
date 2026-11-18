import { Request, Response, NextFunction } from 'express';
import { PillLogService } from './pill-log.service';

export class PillLogController {
  constructor(private pillLogService: PillLogService = new PillLogService()) {}

  public markPill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.pillLogService.markPill(req.body);
      res.json({ success: true, message: `Pill marked as ${result.status}`, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dateStr = req.query.date as string | undefined;
      const today = await this.pillLogService.getTodayStatus(dateStr);
      res.json({ success: true, data: today });
    } catch (error) {
      next(error);
    }
  };

  public getCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const medicineId = req.query.medicineId as string | undefined;
      const calendar = await this.pillLogService.getCalendarMonth(month, medicineId);
      res.json({ success: true, month, data: calendar });
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = req.query.medicineId as string | undefined;
      const stats = await this.pillLogService.getStreakStats(medicineId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}

