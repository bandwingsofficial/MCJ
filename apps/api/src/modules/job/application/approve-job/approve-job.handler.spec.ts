import { Job } from '../../domain/entities/job.entity';
import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobSource } from '../../domain/enums/job-source.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { JobWorkMode } from '../../domain/enums/job-work-mode.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';
import { JobNotPendingApprovalException } from '../../domain/errors/job-business.exception';
import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { ApproveJobCommand, ApproveJobHandler } from './approve-job.handler';
import { RejectJobCommand, RejectJobHandler } from '../reject-job/reject-job.handler';

function makeJob(overrides?: {
  status?: JobStatus;
  jobNumber?: string | null;
  source?: JobSource;
}): Job {
  return Job.reconstitute({
    id: 'job-1',
    title: 'Frontend Engineer',
    slug: 'frontend-engineer',
    jobNumber: overrides?.jobNumber ?? null,
    source: overrides?.source ?? JobSource.COMPANY_ONBOARDING,
    companyName: 'Acme Corp',
    companyLogo: null,
    companyWebsite: null,
    companyEmail: 'hr@acme.test',
    companyPhone: null,
    companyDescription: null,
    description: 'Build UIs',
    shortDescription: null,
    location: 'Bengaluru',
    city: 'Bengaluru',
    state: 'KA',
    country: 'IN',
    isRemote: false,
    workMode: JobWorkMode.ONSITE,
    employmentType: EmploymentType.FULL_TIME,
    workingDays: WorkingDays.MONDAY_TO_FRIDAY,
    category: 'Engineering',
    department: null,
    minExperience: 1,
    maxExperience: 3,
    minSalary: 500000,
    maxSalary: 800000,
    salaryCurrency: 'INR',
    vacancies: 2,
    applicationDeadline: null,
    responsibilities: [],
    skills: [],
    preferredSkills: [],
    qualifications: [],
    benefits: null,
    eligibilityTitle: null,
    interviewProcess: [],
    status: overrides?.status ?? JobStatus.PENDING_APPROVAL,
    isActive: false,
    rejectionReason: null,
    reviewedAt: null,
    reviewedBy: null,
    createdBy: null,
    updatedBy: null,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('ApproveJobHandler / RejectJobHandler onboarding flow', () => {
  const domain = new JobDomainService();
  let saved: Job | null;
  let nextNumberCalls: number;

  const repo: jest.Mocked<Pick<
    JobRepository,
    'findById' | 'save' | 'nextJobNumber'
  >> = {
    findById: jest.fn(),
    save: jest.fn(async (job) => {
      saved = job;
    }),
    nextJobNumber: jest.fn(async () => {
      nextNumberCalls += 1;
      return `JOB-2026-${String(nextNumberCalls).padStart(5, '0')}`;
    }),
  };

  beforeEach(() => {
    saved = null;
    nextNumberCalls = 0;
    jest.clearAllMocks();
    repo.save.mockImplementation(async (job) => {
      saved = job;
    });
    repo.nextJobNumber.mockImplementation(async () => {
      nextNumberCalls += 1;
      return `JOB-2026-${String(nextNumberCalls).padStart(5, '0')}`;
    });
  });

  it('accepts PENDING → ACTIVE and generates a job number', async () => {
    const job = makeJob({ status: JobStatus.PENDING_APPROVAL });
    repo.findById.mockResolvedValue(job);

    const result = await new ApproveJobHandler(
      repo as unknown as JobRepository,
      domain,
    ).execute(new ApproveJobCommand('job-1', 'admin-1'));

    expect(result.status).toBe(JobStatus.ACTIVE);
    expect(result.jobNumber).toBe('JOB-2026-00001');
    expect(result.isActive).toBe(true);
    expect(repo.nextJobNumber).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('accepts REJECTED → ACTIVE (Accept Again) without creating a new job row', async () => {
    const job = makeJob({ status: JobStatus.REJECTED, jobNumber: null });
    repo.findById.mockResolvedValue(job);

    const result = await new ApproveJobHandler(
      repo as unknown as JobRepository,
      domain,
    ).execute(new ApproveJobCommand('job-1', 'admin-1'));

    expect(result.id).toBe('job-1');
    expect(result.status).toBe(JobStatus.ACTIVE);
    expect(result.jobNumber).toBe('JOB-2026-00001');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('is idempotent when already ACTIVE with a job number', async () => {
    const job = makeJob({
      status: JobStatus.ACTIVE,
      jobNumber: 'JOB-2026-00042',
    });
    job.isActive = true;
    repo.findById.mockResolvedValue(job);

    const result = await new ApproveJobHandler(
      repo as unknown as JobRepository,
      domain,
    ).execute(new ApproveJobCommand('job-1', 'admin-1'));

    expect(result.jobNumber).toBe('JOB-2026-00042');
    expect(repo.nextJobNumber).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rejects PENDING → REJECTED and does not assign a job number', async () => {
    const job = makeJob({ status: JobStatus.PENDING_APPROVAL });
    repo.findById.mockResolvedValue(job);

    const result = await new RejectJobHandler(
      repo as unknown as JobRepository,
      domain,
    ).execute(new RejectJobCommand('job-1', 'Incomplete', 'admin-1'));

    expect(result.status).toBe(JobStatus.REJECTED);
    expect(result.jobNumber).toBeNull();
    expect(result.isActive).toBe(false);
  });

  it('does not allow REJECT of an ACTIVE job', async () => {
    const job = makeJob({
      status: JobStatus.ACTIVE,
      jobNumber: 'JOB-2026-00001',
    });
    job.isActive = true;
    repo.findById.mockResolvedValue(job);

    await expect(
      new RejectJobHandler(repo as unknown as JobRepository, domain).execute(
        new RejectJobCommand('job-1'),
      ),
    ).rejects.toBeInstanceOf(JobNotPendingApprovalException);
  });

  it('does not allow approve from CLOSED', async () => {
    const job = makeJob({ status: JobStatus.CLOSED });
    repo.findById.mockResolvedValue(job);

    await expect(
      new ApproveJobHandler(repo as unknown as JobRepository, domain).execute(
        new ApproveJobCommand('job-1'),
      ),
    ).rejects.toBeInstanceOf(JobNotPendingApprovalException);
  });
});
