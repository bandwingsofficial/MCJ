// application/commands/login-user.command.ts

import type { ClientType } from '../../domain/enums/client-type.enum';

export class LoginUserCommand {
  constructor(
    public readonly identifier: string,
    public readonly password: string,

    public readonly userAgent?: string,
    public readonly ipAddress?: string,
    public readonly clientType?: ClientType,
  ) {}
}
