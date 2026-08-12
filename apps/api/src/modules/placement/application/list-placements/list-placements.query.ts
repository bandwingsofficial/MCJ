import { PlacementStatus } from '../../domain/enums/placement-status.enum';

export class ListPlacementsQuery {
  constructor(
    public readonly jobId?: string,
    public readonly userId?: string,
    public readonly status?: PlacementStatus,
    public readonly search?: string,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
