import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationStatus } from '../enums/job-application-status.enum';

export interface JobApplicationJobView {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  status: string;
  employmentType: string;
}

export interface JobApplicationUserProfileView {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface JobApplicationUserView {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  profile: JobApplicationUserProfileView | null;
}

export interface JobApplicationDetailView {
  id: string;
  jobId: string;
  studentId: string;
  resumeFileId: string | null;
  coverLetter: string | null;
  currentLocation: string | null;
  expectedSalary: number | null;
  remarks: string | null;
  status: JobApplicationStatus;
  isDeleted: boolean;
  deletedAt: Date | null;
  job: JobApplicationJobView;
  user: JobApplicationUserView;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplicationListFilters {
  jobId?: string;
  studentId?: string;
  status?: JobApplicationStatus;
  search?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface JobApplicationRepository {
  save(application: JobApplication): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<JobApplication | null>;

  findDetailById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<JobApplicationDetailView | null>;

  findByJobAndStudent(
    jobId: string,
    studentId: string,
    includeDeleted?: boolean,
  ): Promise<JobApplication | null>;

  findDetails(
    filters?: JobApplicationListFilters,
  ): Promise<JobApplicationDetailView[]>;

  findDetailsByStudentId(
    studentId: string,
    includeDeleted?: boolean,
  ): Promise<JobApplicationDetailView[]>;

  deletePermanent(id: string): Promise<void>;
}