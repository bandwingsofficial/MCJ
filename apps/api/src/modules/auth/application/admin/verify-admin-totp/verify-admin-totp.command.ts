// application/admin/verify-admin-totp.command.ts

export class VerifyAdminTotpCommand {
  constructor(
    // 🔐 temporary MFA token
    public readonly mfaToken: string,

    // 🔢 authenticator app code
    public readonly totpCode: string,

    // 🔐 session tracking
    public readonly userAgent?: string,

    public readonly ipAddress?: string,
  ) {}
}
