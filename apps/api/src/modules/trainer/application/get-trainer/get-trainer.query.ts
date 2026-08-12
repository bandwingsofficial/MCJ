export class GetTrainerQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
  ) {}
}
