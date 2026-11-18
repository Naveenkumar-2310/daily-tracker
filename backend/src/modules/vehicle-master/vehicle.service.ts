import { VehicleRepository } from './vehicle.repository';
import { IVehicle, ICreateVehicleDTO, IUpdateVehicleDTO } from './vehicle.interface';

export class VehicleService {
  constructor(private vehicleRepo: VehicleRepository = new VehicleRepository()) {}

  public async getAllVehicles(onlyActive: boolean = false): Promise<IVehicle[]> {
    return this.vehicleRepo.findAll(onlyActive);
  }

  public async getVehicleById(id: string): Promise<IVehicle> {
    const vehicle = await this.vehicleRepo.findById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    return vehicle;
  }

  public async createVehicle(dto: ICreateVehicleDTO): Promise<IVehicle> {
    return this.vehicleRepo.create(dto);
  }

  public async updateVehicle(id: string, dto: IUpdateVehicleDTO): Promise<IVehicle> {
    const updated = await this.vehicleRepo.update(id, dto);
    if (!updated) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    return updated;
  }

  public async deleteVehicle(id: string): Promise<void> {
    const success = await this.vehicleRepo.delete(id);
    if (!success) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
  }
}

