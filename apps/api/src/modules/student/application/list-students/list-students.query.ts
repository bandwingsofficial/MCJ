import { StudentStatus } from '../../domain/enums/student-status.enum';

export class ListStudentsQuery {
  constructor(
    public readonly branchId?: string,
    public readonly status?: StudentStatus,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
