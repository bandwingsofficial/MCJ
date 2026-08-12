import { Role } from '../../domain/enums/role.enum';

export class GetMeResult {
  constructor(
    public readonly id: string,

    public readonly email: string,

    public readonly name: string,

    public readonly role: Role,

    public readonly phone: string | null,

    public readonly mfaEnabled: boolean,

    public readonly createdAt: Date,

    /** Current authenticated session (from access token), if present */
    public readonly sessionId: string | null,
  ) {}
}
