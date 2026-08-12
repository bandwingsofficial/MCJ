// application/results/register-user.result.ts
import { Role } from '../../domain/enums/role.enum';

export class RegisterUserResult {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: Role,
    public readonly createdAt: Date,
  ) {}
}
