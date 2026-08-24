export class GetMyEnrollmentByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly enrollmentId: string,
  ) {}
}
