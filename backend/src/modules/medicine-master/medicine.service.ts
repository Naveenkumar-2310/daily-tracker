import { MedicineRepository } from './medicine.repository';
import { IMedicine, ICreateMedicineDTO, IUpdateMedicineDTO } from './medicine.interface';

export class MedicineService {
  constructor(private medicineRepo: MedicineRepository = new MedicineRepository()) {}

  public async getAllMedicines(onlyActive: boolean = false): Promise<IMedicine[]> {
    return this.medicineRepo.findAll(onlyActive);
  }

  public async getMedicineById(id: string): Promise<IMedicine> {
    const med = await this.medicineRepo.findById(id);
    if (!med) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    return med;
  }

  public async createMedicine(dto: ICreateMedicineDTO): Promise<IMedicine> {
    return this.medicineRepo.create(dto);
  }

  public async updateMedicine(id: string, dto: IUpdateMedicineDTO): Promise<IMedicine> {
    const updated = await this.medicineRepo.update(id, dto);
    if (!updated) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    return updated;
  }

  public async deleteMedicine(id: string): Promise<void> {
    const success = await this.medicineRepo.delete(id);
    if (!success) {
      throw new Error(`Medicine with id ${id} not found`);
    }
  }
}

