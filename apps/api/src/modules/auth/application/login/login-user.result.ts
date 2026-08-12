// application/login/login-user.result.ts

import { Role } from '../../domain/enums/role.enum';

export class LoginUserResult {
  constructor(
    public readonly id: string,

    public readonly email: string,

    public readonly name: string,

    public readonly role: Role,

    public readonly sessionId: string,

    public readonly loginType: 'EMAIL' | 'PHONE',

    public readonly phone: string | null,

    public readonly accessToken: string,

    public readonly refreshToken: string,

    public readonly accessTokenExpiresAt: Date,

    public readonly refreshTokenExpiresAt: Date,
  ) {}
}
