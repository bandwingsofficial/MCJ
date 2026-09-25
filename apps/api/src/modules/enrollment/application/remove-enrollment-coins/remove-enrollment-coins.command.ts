export class RemoveEnrollmentCoinsCommand {
  constructor(
    public readonly userId: string,
    public readonly enrollmentId: string,
  ) {}
}
