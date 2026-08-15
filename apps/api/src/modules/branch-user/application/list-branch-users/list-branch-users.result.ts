import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class ListBranchUserItemResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly role: BranchUserRole,
    public readonly permissions: Permission[],

    public readonly branchId: string,
    public readonly branchName: string,
    public readonly branchCode: string,

    public readonly isActive: boolean,
    public readonly isDeleted: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class ListBranchUsersResult {
  constructor(
    public readonly items: ListBranchUserItemResult[],
    public readonly count: number,
  ) {}
}