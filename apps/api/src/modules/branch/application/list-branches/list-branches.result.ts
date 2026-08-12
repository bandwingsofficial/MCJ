import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class ListBranchItemResult {
  constructor(
    public readonly id: string,

    public readonly branchName: string,

    public readonly branchCode: string,

    public readonly email: string | null,
    public readonly phone: string | null,

    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,

    public readonly status: BranchStatus,

    public readonly displayOrder: number | null,

    public readonly deletedAt: Date | null,

    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class ListBranchesResult {
  constructor(
    public readonly items: ListBranchItemResult[],

    public readonly count: number,

    public readonly meta: {
      total: number;
      skip: number;
      take: number;
    },
  ) {}
}
