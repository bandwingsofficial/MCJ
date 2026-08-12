import { Trainer } from '../entities/trainer.entity';
import { TrainerStatus } from '../enums/trainer-status.enum';
import { TrainerType } from '../enums/trainer-type.enum';

export interface TrainerListFilters {
  branchId?: string;
  status?: TrainerStatus;
  trainerType?: TrainerType;
  search?: string;
  isFeatured?: boolean;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  skip?: number;
  take?: number;
}

export interface TrainerRepository {
  save(trainer: Trainer): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Trainer | null>;
  findByEmail(
    email: string,
    includeDeleted?: boolean,
  ): Promise<Trainer | null>;

  findByPhone(
  phone: string,
  includeDeleted?: boolean,
): Promise<Trainer | null>;

  findByEmployeeCode(
    employeeCode: string,
    includeDeleted?: boolean,
  ): Promise<Trainer | null>;
  findAll(filters?: TrainerListFilters): Promise<Trainer[]>;
  deletePermanent(id: string): Promise<void>;
}
