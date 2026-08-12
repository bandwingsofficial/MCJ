export class GetJobBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly onlyPublic = false,
  ) {}
}
