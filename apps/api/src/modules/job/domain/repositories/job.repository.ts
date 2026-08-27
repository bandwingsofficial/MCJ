import { Job } from '../entities/job.entity';
import { JobSource } from '../enums/job-source.enum';
import { JobStatus } from '../enums/job-status.enum';

export interface JobListFilters {
  status?: JobStatus;
  excludeStatuses?: JobStatus[];
  source?: JobSource;
  employmentType?: string;
  search?: string;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  onlyPublic?: boolean;
  isActive?: boolean;
  onlyDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface JobRepository {
  save(job: Job): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Job | null>;
  findBySlug(
    slug: string,
    includeDeleted?: boolean,
  ): Promise<Job | null>;
  findAll(filters?: JobListFilters): Promise<Job[]>;
  count(filters?: JobListFilters): Promise<number>;
  nextJobNumber(): Promise<string>;
  existsBySlug(
    slug: string,
    excludeId?: string,
  ): Promise<boolean>;
  hasApplications(jobId: string): Promise<boolean>;
  deletePermanent(id: string): Promise<void>;
}
