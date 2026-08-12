import { PlacementStatus } from '../../domain/enums/placement-status.enum';

export class UpdatePlacementCommand {
  constructor(
    public readonly id: string,
    public readonly designation?: string | null,
    public readonly salary?: number | null,
    public readonly joiningDate?: Date | null,
    public readonly remarks?: string | null,
    public readonly status?: PlacementStatus,
    public readonly updatedBy?: string,
  ) {}
}
