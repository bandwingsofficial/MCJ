import { JobApplicationStatus } from '../enums/job-application-status.enum';

export class JobApplication {
  private constructor(
    public readonly id: string,
    public jobId: string,
    public studentId: string,
    public resumeFileId: string | null,
    public coverLetter: string | null,
    public currentLocation: string | null,
    public expectedSalary: number | null,
    public remarks: string | null,
    public status: JobApplicationStatus,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: JobApplicationCreateParams): JobApplication {
    return new JobApplication(
      params.id,
      params.jobId,
      params.studentId,
      params.resumeFileId ?? null,
      params.coverLetter ?? null,
      params.currentLocation ?? null,
      params.expectedSalary ?? null,
      params.remarks ?? null,
      JobApplicationStatus.APPLIED,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: JobApplicationReconstituteParams,
  ): JobApplication {
    return new JobApplication(
      params.id,
      params.jobId,
      params.studentId,
      params.resumeFileId,
      params.coverLetter,
      params.currentLocation,
      params.expectedSalary,
      params.remarks,
      params.status,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: JobApplicationUpdateParams) {
    if (params.resumeFileId !== undefined) {
      this.resumeFileId = params.resumeFileId;
    }

    if (params.coverLetter !== undefined) {
      this.coverLetter = params.coverLetter;
    }

    if (params.currentLocation !== undefined) {
      this.currentLocation = params.currentLocation;
    }

    if (params.expectedSalary !== undefined) {
      this.expectedSalary = params.expectedSalary;
    }

    if (params.remarks !== undefined) {
      this.remarks = params.remarks;
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  changeStatus(
    status: JobApplicationStatus,
    updatedBy?: string | null,
  ) {
    this.status = status;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface JobApplicationCreateParams {
  id: string;
  jobId: string;
  studentId: string;
  resumeFileId?: string | null;
  coverLetter?: string | null;
  currentLocation?: string | null;
  expectedSalary?: number | null;
  remarks?: string | null;
  createdBy?: string | null;
}

export interface JobApplicationUpdateParams {
  resumeFileId?: string | null;
  coverLetter?: string | null;
  currentLocation?: string | null;
  expectedSalary?: number | null;
  remarks?: string | null;
  updatedBy?: string | null;
}

export interface JobApplicationReconstituteParams
  extends Required<JobApplicationCreateParams> {
  status: JobApplicationStatus;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}