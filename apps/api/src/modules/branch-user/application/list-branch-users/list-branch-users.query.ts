import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';

export class ListBranchUsersQuery {
  constructor(
    public readonly branchId?: string,
    public readonly role?: BranchUserRole,
    public readonly isActive?: boolean,
    public readonly search?: string,
    public readonly includeDeleted: boolean = false,
    public readonly isDeleted?: boolean,
    public readonly skip: number = 0,
    public readonly take: number = 50,
  ) {}
}
