// application/admin/login-admin.command.ts

export class LoginAdminCommand {
  constructor(
    public readonly email: string,

    public readonly password: string,

    // 🔐 session tracking
    public readonly userAgent?: string,

    public readonly ipAddress?: string,
  ) {}
}
