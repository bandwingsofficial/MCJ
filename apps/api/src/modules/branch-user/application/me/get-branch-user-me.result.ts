import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class BranchUserMeBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
    public readonly city: string | null,
    public readonly phone: string | null,
  ) {}
}

export class GetBranchUserMeResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly role: BranchUserRole,
    public readonly permissions: Permission[],
    public readonly branchId: string,
    public readonly branch: BranchUserMeBranchResult | null,
    public readonly isActive: boolean,
    public readonly lastLoginAt: Date | null,
  ) {}
}
