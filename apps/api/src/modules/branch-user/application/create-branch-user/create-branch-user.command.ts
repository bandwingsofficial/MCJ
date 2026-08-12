import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class CreateBranchUserCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string | undefined,
    public readonly email: string,
    public readonly phone: string | undefined,
    public readonly password: string,
    public readonly role: BranchUserRole,
    public readonly permissions: Permission[] | undefined,
    public readonly branchId: string,
    public readonly createdBy: string,
  ) {}
}
