import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';

export class VehicleController {
  constructor(private vehicleService: VehicleService = new VehicleService()) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const onlyActive = req.query.active === 'true';
      const list = await this.vehicleService.getAllVehicles(onlyActive);
      res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.vehicleService.getVehicleById(req.params.id);
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.vehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, message: 'Vehicle added successfully', data: created });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.vehicleService.updateVehicle(req.params.id, req.body);
      res.json({ success: true, message: 'Vehicle updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.vehicleService.deleteVehicle(req.params.id);
      res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

