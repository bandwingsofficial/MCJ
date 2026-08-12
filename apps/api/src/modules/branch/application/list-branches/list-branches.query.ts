import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class ListBranchesQuery {
  constructor(
    public readonly status?: BranchStatus,

    public readonly search?: string,

    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,

    public readonly includeDeleted: boolean = false,

    public readonly skip: number = 0,
    public readonly take: number = 50,
  ) {}
}
