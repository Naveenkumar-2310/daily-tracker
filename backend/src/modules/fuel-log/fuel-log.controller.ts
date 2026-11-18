import { Request, Response, NextFunction } from 'express';
import { FuelLogService } from './fuel-log.service';

export class FuelLogController {
  constructor(private fuelLogService: FuelLogService = new FuelLogService()) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.fuelLogService.createFuelLog(req.body);
      res.status(201).json({
        success: true,
        message: 'Fuel entry logged successfully',
        data: result.log,
        analysis: result.mileageAnalysis,
      });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicleId = req.query.vehicleId as string | undefined;
      const history = await this.fuelLogService.getHistory(vehicleId);
      res.json({ success: true, count: history.length, data: history });
    } catch (error) {
      next(error);
    }
  };

  public getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicleId = req.params.vehicleId;
      const analytics = await this.fuelLogService.getAnalytics(vehicleId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const deleted = await this.fuelLogService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Fuel log not found' });
        return;
      }
      res.json({ success: true, message: 'Fuel log deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

