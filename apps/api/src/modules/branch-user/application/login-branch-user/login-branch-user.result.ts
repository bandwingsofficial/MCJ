import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class LoginBranchUserResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly role: BranchUserRole,
    public readonly permissions: Permission[],
    public readonly branchId: string,
    public readonly sessionId: string,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly accessTokenExpiresAt: Date,
    public readonly refreshTokenExpiresAt: Date,
  ) {}
}
