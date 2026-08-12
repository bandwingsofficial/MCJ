import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class GetBranchResult {
  constructor(
    public readonly id: string,

    public readonly branchName: string,

    public readonly branchCode: string,

    public readonly email: string | null,
    public readonly phone: string | null,

    public readonly addressLine1: string | null,
    public readonly addressLine2: string | null,

    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,

    public readonly postalCode: string | null,

    public readonly latitude: number | null,
    public readonly longitude: number | null,

    public readonly status: BranchStatus,

    public readonly description: string | null,

    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
