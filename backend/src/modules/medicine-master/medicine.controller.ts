import { Request, Response, NextFunction } from 'express';
import { MedicineService } from './medicine.service';

export class MedicineController {
  constructor(private medicineService: MedicineService = new MedicineService()) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const onlyActive = req.query.active === 'true';
      const list = await this.medicineService.getAllMedicines(onlyActive);
      res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicine = await this.medicineService.getMedicineById(req.params.id);
      res.json({ success: true, data: medicine });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.medicineService.createMedicine(req.body);
      res.status(201).json({ success: true, message: 'Medicine created successfully', data: created });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.medicineService.updateMedicine(req.params.id, req.body);
      res.json({ success: true, message: 'Medicine updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.medicineService.deleteMedicine(req.params.id);
      res.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

