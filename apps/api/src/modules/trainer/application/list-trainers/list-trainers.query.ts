import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

export class ListTrainersQuery {
  constructor(
    public readonly branchId?: string,
    public readonly status?: TrainerStatus,
    public readonly trainerType?: TrainerType,
    public readonly search?: string,
    public readonly isFeatured?: boolean,
    public readonly includeDeleted = false,
    public readonly isDeleted?: boolean,
    public readonly onlyActive = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
