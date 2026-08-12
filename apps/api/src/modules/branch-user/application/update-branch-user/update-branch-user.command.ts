import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class UpdateBranchUserCommand {
  constructor(
    public readonly branchUserId: string,
    public readonly firstName?: string,
    public readonly lastName?: string | null,
    public readonly email?: string,
    public readonly phone?: string | null,
    public readonly role?: BranchUserRole,
    public readonly permissions?: Permission[],
    public readonly branchId?: string,
    public readonly updatedBy?: string,
  ) {}
}
