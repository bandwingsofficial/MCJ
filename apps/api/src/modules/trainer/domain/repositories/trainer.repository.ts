import { Trainer } from '../entities/trainer.entity';
import { TrainerStatus } from '../enums/trainer-status.enum';
import { TrainerType } from '../enums/trainer-type.enum';

export interface TrainerListFilters {
  branchId?: string;
  courseId?: string;
  status?: TrainerStatus;
  trainerType?: TrainerType;
  search?: string;
  isFeatured?: boolean;
  includeDeleted?: boolean;
  isDeleted?: boolean;
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
  findByIdIncludingDeleted(
    id: string,
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
  count(filters?: TrainerListFilters): Promise<number>;
  assignCourse(trainerId: string, courseId: string): Promise<void>;
  unassignCourse(trainerId: string, courseId: string): Promise<void>;
  getMaxNumericSuffixForPrefix(prefix: string): Promise<number>;
  getMaxDisplayOrder(): Promise<number>;
  getMaxActiveDisplayOrder(): Promise<number>;
  closeDisplayOrderGap(deletedDisplayOrder: number): Promise<void>;
  moveDisplayOrder(
    trainerId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;
  deletePermanent(id: string): Promise<void>;
}
