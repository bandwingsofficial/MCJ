// application/admin/verify-admin-totp.result.ts

import { Role } from '../../../domain/enums/role.enum';

export class VerifyAdminTotpResult {
  constructor(
    public readonly id: string,

    public readonly email: string,

    public readonly name: string,

    public readonly role: Role,

    public readonly sessionId: string,

    // 🔐 MFA
    public readonly mfaVerified: boolean,

    public readonly accessToken: string,

    public readonly refreshToken: string,

    public readonly accessTokenExpiresAt: Date,

    public readonly refreshTokenExpiresAt: Date,
  ) {}
}
