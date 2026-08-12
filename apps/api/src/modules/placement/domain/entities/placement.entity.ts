import { PlacementStatus } from '../enums/placement-status.enum';

export class Placement {
  private constructor(
    public readonly id: string,
    public jobId: string,
    public applicationId: string,
    public userId: string,
    public companyName: string,
    public designation: string | null,
    public salary: number | null,
    public joiningDate: Date | null,
    public remarks: string | null,
    public status: PlacementStatus,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: PlacementCreateParams): Placement {
    return new Placement(
      params.id,
      params.jobId,
      params.applicationId,
      params.userId,
      params.companyName,
      params.designation ?? null,
      params.salary ?? null,
      params.joiningDate ?? null,
      params.remarks ?? null,
      params.status ?? PlacementStatus.PENDING,
      params.createdBy ?? null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: PlacementReconstituteParams): Placement {
    return new Placement(
      params.id,
      params.jobId,
      params.applicationId,
      params.userId,
      params.companyName,
      params.designation,
      params.salary,
      params.joiningDate,
      params.remarks,
      params.status,
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: PlacementUpdateParams) {
    if (params.designation !== undefined) {
      this.designation = params.designation;
    }
    if (params.salary !== undefined) this.salary = params.salary;
    if (params.joiningDate !== undefined) {
      this.joiningDate = params.joiningDate;
    }
    if (params.remarks !== undefined) this.remarks = params.remarks;
    if (params.status !== undefined) this.status = params.status;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface PlacementCreateParams {
  id: string;
  jobId: string;
  applicationId: string;
  userId: string;
  companyName: string;
  designation?: string | null;
  salary?: number | null;
  joiningDate?: Date | null;
  remarks?: string | null;
  status?: PlacementStatus;
  createdBy?: string | null;
}

export interface PlacementUpdateParams {
  designation?: string | null;
  salary?: number | null;
  joiningDate?: Date | null;
  remarks?: string | null;
  status?: PlacementStatus;
  updatedBy?: string | null;
}

export interface PlacementReconstituteParams
  extends Required<PlacementCreateParams> {
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
