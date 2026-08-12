// application/admin/verify-admin-totp.command.ts

import type { ClientType } from '../../../domain/enums/client-type.enum';

export class VerifyAdminTotpCommand {
  constructor(
    public readonly mfaToken: string,

    public readonly totpCode: string,

    public readonly userAgent?: string,

    public readonly ipAddress?: string,

    public readonly clientType?: ClientType,
  ) {}
}
