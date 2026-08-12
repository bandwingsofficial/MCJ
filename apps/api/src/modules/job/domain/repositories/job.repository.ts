import { Job } from '../entities/job.entity';
import { JobStatus } from '../enums/job-status.enum';

export interface JobListFilters {
  status?: JobStatus;
  employmentType?: string;
  search?: string;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  onlyPublic?: boolean;
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
  existsBySlug(
    slug: string,
    excludeId?: string,
  ): Promise<boolean>;
  hasApplications(jobId: string): Promise<boolean>;
  deletePermanent(id: string): Promise<void>;
}
