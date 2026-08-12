export class ListBranchesQuery {
  constructor(
    public readonly status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',

    public readonly search?: string,

    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,

    public readonly includeDeleted: boolean = true,

    public readonly skip: number = 0,
    public readonly take: number = 50,
  ) {}
}
