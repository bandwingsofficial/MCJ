export class CheckCategoryAvailabilityQuery {
  constructor(
    public readonly name?: string,
    public readonly slug?: string,
    public readonly excludeId?: string,
  ) {}
}
