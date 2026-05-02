// application/results/register-user.result.ts
export class RegisterUserResult {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    public readonly createdAt: Date,
  ) {}
}