export class ApplyEnrollmentCoinsCommand {
  constructor(
    public readonly userId: string,
    public readonly enrollmentId: string,
    public readonly coins: number,
  ) {}
}
