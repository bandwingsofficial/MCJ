import { TrainerStatus } from '../../domain/enums/trainer-status.enum';

export class BulkUpdateTrainerStatusCommand {
  constructor(
    public readonly trainerIds: string[],
    public readonly status: TrainerStatus,
  ) {}
}
