export class GetStudentPortalAccessQuery {
  constructor(
    public readonly userId: string,
    public readonly email?: string | null,
  ) {}
}
