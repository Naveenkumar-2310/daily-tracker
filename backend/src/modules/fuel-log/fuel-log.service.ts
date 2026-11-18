import { FuelLogRepository } from './fuel-log.repository';
import { VehicleRepository } from '../vehicle-master/vehicle.repository';
import { ICreateFuelLogDTO, IFuelLog, IFuelAnalyticsSummary } from './fuel-log.interface';

export class FuelLogService {
  constructor(
    private fuelLogRepo: FuelLogRepository = new FuelLogRepository(),
    private vehicleRepo: VehicleRepository = new VehicleRepository()
  ) {}

  public async createFuelLog(dto: ICreateFuelLogDTO): Promise<{
    log: IFuelLog;
    mileageAnalysis: {
      distanceCovered: number;
      actualMileage: number;
      expectedMileage: number;
      performancePercentage: number;
      isAboveTarget: boolean;
      message: string;
    } | null;
  }> {
    const vehicle = await this.vehicleRepo.findById(dto.vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${dto.vehicleId} not found`);
    }

    // Determine litres filled
    let litresFilled = dto.litresFilled;
    if (!litresFilled && dto.fuelPricePerLitre) {
      litresFilled = Number((dto.petrolAmount / dto.fuelPricePerLitre).toFixed(2));
    }
    if (!litresFilled || litresFilled <= 0) {
      throw new Error('Could not calculate fuel volume in litres');
    }

    // Find previous odometer to calculate trip distance
    const previousLog = await this.fuelLogRepo.findLatestBefore(dto.vehicleId, dto.odometerKm);
    const previousKm = previousLog ? previousLog.odometerKm : vehicle.initialOdometerKm;
    const isFullTank = dto.isFullTank !== false;

    let distanceCovered: number | undefined;
    let actualMileage: number | undefined;
    let mileageAnalysis = null;

    if (dto.odometerKm > previousKm) {
      distanceCovered = Number((dto.odometerKm - previousKm).toFixed(1));

      if (isFullTank) {
        actualMileage = Number((distanceCovered / litresFilled).toFixed(2));

        const expected = vehicle.expectedMileage;
        const perfPct = Number((((actualMileage - expected) / expected) * 100).toFixed(1));
        const isAbove = actualMileage >= expected;

        let message = '';
        if (isAbove) {
          message = `Great! Mileage is ${actualMileage} km/L (${perfPct}% above your ${expected} km/L baseline 🎯)`;
        } else {
          message = `Mileage is ${actualMileage} km/L (${Math.abs(perfPct)}% below your ${expected} km/L baseline). Check tire pressure or traffic conditions.`;
        }

        mileageAnalysis = {
          distanceCovered,
          actualMileage,
          expectedMileage: expected,
          performancePercentage: perfPct,
          isAboveTarget: isAbove,
          message,
        };
      } else {
        mileageAnalysis = {
          distanceCovered,
          actualMileage: 0,
          expectedMileage: vehicle.expectedMileage,
          performancePercentage: 0,
          isAboveTarget: true,
          message: `Partial top-up logged (💧). Added ${litresFilled}L (${distanceCovered} km run). Full tank fill needed for exact mileage calculation.`,
        };
      }
    }

    const created = await this.fuelLogRepo.create({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      date: dto.date,
      odometerKm: dto.odometerKm,
      petrolAmount: dto.petrolAmount,
      fuelPricePerLitre: dto.fuelPricePerLitre,
      litresFilled,
      distanceCovered,
      actualMileage,
      imageUrl: dto.imageUrl,
      notes: dto.notes,
    });

    return { log: created, mileageAnalysis };
  }

  public async getHistory(vehicleId?: string): Promise<IFuelLog[]> {
    return this.fuelLogRepo.findAll(vehicleId);
  }

  public async getAnalytics(vehicleId: string): Promise<IFuelAnalyticsSummary> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${vehicleId} not found`);
    }

    const logs = await this.fuelLogRepo.findAll(vehicleId);
    const totalSpent = logs.reduce((sum, l) => sum + l.petrolAmount, 0);
    const totalLitres = logs.reduce((sum, l) => sum + l.litresFilled, 0);
    const totalDistanceKm = logs.reduce((sum, l) => sum + (l.distanceCovered || 0), 0);

    const averageMileage = totalLitres > 0 && totalDistanceKm > 0
      ? Number((totalDistanceKm / totalLitres).toFixed(2))
      : vehicle.expectedMileage;

    const averageCostPerKm = totalDistanceKm > 0
      ? Number((totalSpent / totalDistanceKm).toFixed(2))
      : 0;

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      expectedMileage: vehicle.expectedMileage,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalLitres: Number(totalLitres.toFixed(2)),
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      averageMileage,
      averageCostPerKm,
      logsCount: logs.length,
    };
  }

  public async delete(id: string): Promise<boolean> {
    return this.fuelLogRepo.delete(id);
  }
}

