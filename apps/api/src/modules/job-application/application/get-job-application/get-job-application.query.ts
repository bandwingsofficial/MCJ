export class GetJobApplicationQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
  ) {}
}
