export class CheckCategoryAvailabilityResult {
  constructor(
    public readonly nameAvailable: boolean | null,
    public readonly slugAvailable: boolean | null,
    public readonly nameMessage: string | null,
    public readonly slugMessage: string | null,
  ) {}
}
