export class GetMyStudentQuery {
  constructor(
    public readonly userId: string,
    public readonly email?: string | null,
  ) {}
}
