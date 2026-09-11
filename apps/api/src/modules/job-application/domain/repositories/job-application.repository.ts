import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationInterviewStatus } from '../enums/job-application-interview-status.enum';
import { JobApplicationStatus } from '../enums/job-application-status.enum';

export interface JobApplicationJobView {
  id: string;
  title: string;
  slug: string;
  jobNumber?: string | null;
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

export interface JobApplicationStudentView {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  qualification: string | null;
  collegeName: string | null;
  specialization: string | null;
  passingYear: number | null;
  parentName: string | null;
  parentPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  status: string;
  jobStatus: string | null;
}

export interface JobApplicationDetailView {
  id: string;
  jobId: string;
  studentId: string | null;
  applicationNumber: string;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhone: string | null;
  highestQualification: string | null;
  yearsOfExperience: number | null;
  resumeFileId: string | null;
  coverLetter: string | null;
  currentLocation: string | null;
  expectedSalary: number | null;
  remarks: string | null;
  status: JobApplicationStatus;
  interviewStatus: JobApplicationInterviewStatus;
  isDeleted: boolean;
  deletedAt: Date | null;
  job: JobApplicationJobView;
  user: JobApplicationUserView | null;
  student: JobApplicationStudentView | null;
  resolvedStudentCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplicationListFilters {
  jobId?: string;
  studentId?: string;
  status?: JobApplicationStatus;
  interviewStatus?: JobApplicationInterviewStatus;
  search?: string;
  appliedFrom?: Date;
  appliedTo?: Date;
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

  findByJobAndEmail(
    jobId: string,
    email: string,
    includeDeleted?: boolean,
  ): Promise<JobApplication | null>;

  nextApplicationNumber(): Promise<string>;

  findDetails(
    filters?: JobApplicationListFilters,
  ): Promise<JobApplicationDetailView[]>;

  count(filters?: JobApplicationListFilters): Promise<number>;

  findDetailsByStudentId(
    studentId: string,
    includeDeleted?: boolean,
  ): Promise<JobApplicationDetailView[]>;

  updateStudentId(
    applicationId: string,
    studentId: string,
  ): Promise<void>;

  deletePermanent(id: string): Promise<void>;
}