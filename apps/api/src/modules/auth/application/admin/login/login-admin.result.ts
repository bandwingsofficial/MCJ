// application/admin/login-admin.result.ts

import { Role } from '../../../domain/enums/role.enum';

export class LoginAdminResult {
  constructor(
    public readonly id: string,

    public readonly email: string,

    public readonly name: string,

    public readonly role: Role,

    public readonly requiresMfa: boolean,

    public readonly mfaToken: string,
  ) {}
}
