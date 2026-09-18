import { EnrollmentAlreadyExistsException } from '../errors/enrollment-already-exists.exception';
import { EnrollmentHistoricalReadOnlyException } from '../errors/enrollment-business.exception';
import type {
  EnrollmentDetailView,
  EnrollmentRepository,
} from '../repositories/enrollment.repository';
import { EnrollmentDomainService } from './enrollment-domain.service';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

const STUDENT_ID = 'student-1';
const BATCH_A = 'batch-a';
const BATCH_B = 'batch-b';

function detail(
  overrides?: Partial<{
    id: string;
    status: EnrollmentStatus;
    batchId: string;
    branchName: string;
  }>,
): EnrollmentDetailView {
  const batchId = overrides?.batchId ?? BATCH_A;
  return {
    id: overrides?.id ?? 'enroll-1',
    enrollmentNumber: 'ENR-1',
    status: overrides?.status ?? EnrollmentStatus.ADMITTED,
    paymentStatus: 'UNPAID' as EnrollmentDetailView['paymentStatus'],
    source: 'ADMIN' as EnrollmentDetailView['source'],
    applicationType: 'OFFLINE' as EnrollmentDetailView['applicationType'],
    mode: 'OFFLINE' as EnrollmentDetailView['mode'],
    feeAmount: 0,
    discountAmount: 0,
    finalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    admissionDate: null,
    joiningDate: null,
    expectedCompletionDate: null,
    remarks: null,
    rejectionReason: null,
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    student: {
      id: STUDENT_ID,
      studentCode: 'STU0001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: null,
      phone: null,
      gender: null,
      qualification: null,
      profileImageUrl: null,
      status: 'ADMITTED',
      applicationType: 'OFFLINE',
      isActive: true,
      updatedAt: new Date(),
    },
    branch: {
      id: 'branch-1',
      branchName: overrides?.branchName ?? 'Branch A',
      branchCode: 'BR-A',
    },
    category: {
      id: 'cat-1',
      name: 'Accounting',
      slug: 'accounting',
    },
    course: {
      id: 'course-1',
      title: 'CA Foundation',
      slug: 'ca-foundation',
      tagline: null,
      shortDescription: null,
      duration: null,
      durationType: null,
      level: 'BEGINNER',
      language: 'en',
      thumbnailUrl: null,
      status: 'PUBLISHED',
      averageRating: 0,
      totalReviews: 0,
      updatedAt: new Date(),
      trainers: [],
    },
    batch: {
      id: batchId,
      name: 'Morning batch',
      code: 'B1',
      slug: 'morning',
      description: null,
      startDate: new Date(),
      endDate: null,
      startTime: '09:00',
      endTime: '11:00',
      daysOfWeek: [],
      capacity: 30,
      enrolledCount: 1,
      mode: 'OFFLINE',
      durationValue: null,
      durationType: null,
      classroom: null,
      meetingLink: null,
      status: 'ONGOING',
      isFeatured: false,
      isActive: true,
      pricing: {
        originalPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
        discountedPrice: 0,
        currency: 'INR',
        isFree: true,
      },
      trainers: [],
    },
    batchTimingId: null,
    batchTiming: null,
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('EnrollmentDomainService per-batch current enrollment rule', () => {
  const domain = new EnrollmentDomainService();

  function repo(
    current: EnrollmentDetailView | null,
    options?: {
      sameBatch?: { id: string; isCurrent: () => boolean } | null;
    },
  ): EnrollmentRepository {
    const sameBatch =
      options && 'sameBatch' in options
        ? options.sameBatch
        : current
          ? { id: current.id, isCurrent: () => true }
          : null;

    return {
      findCurrentDetailByStudentId: jest.fn().mockResolvedValue(current),
      findByStudentAndBatch: jest.fn().mockResolvedValue(sameBatch),
      findDetailById: jest.fn().mockResolvedValue(current),
    } as unknown as EnrollmentRepository;
  }

  it('allows enrollment when the student has no current enrollment', async () => {
    await expect(
      domain.ensureNoCurrentEnrollment(repo(null), STUDENT_ID, {
        intendedBatchId: BATCH_A,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects a second enrollment into the same batch', async () => {
    const existing = detail({ batchId: BATCH_A, branchName: 'Malleswaram' });

    await expect(
      domain.ensureNoCurrentEnrollment(repo(existing), STUDENT_ID, {
        intendedBatchId: BATCH_A,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'STUDENT_ALREADY_ENROLLED',
    });
  });

  it('allows enrollment into another batch while one is already current', async () => {
    const existing = detail({ batchId: BATCH_A, branchName: 'Malleswaram' });

    await expect(
      domain.ensureNoCurrentEnrollment(
        repo(existing, { sameBatch: null }),
        STUDENT_ID,
        { intendedBatchId: BATCH_B },
      ),
    ).resolves.toBeUndefined();
  });

  it('allows enrollment into a batch in another branch', async () => {
    const existing = detail({
      batchId: BATCH_A,
      branchName: 'Rajinagar',
    });

    await expect(
      domain.ensureNoCurrentEnrollment(
        repo(existing, { sameBatch: null }),
        STUDENT_ID,
        { intendedBatchId: BATCH_B },
      ),
    ).resolves.toBeUndefined();
  });

  it('does not treat a completed enrollment as current', async () => {
    await expect(
      domain.ensureNoCurrentEnrollment(repo(null), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).resolves.toBeUndefined();
  });

  it('does not treat a cancelled enrollment as current', async () => {
    await expect(
      domain.ensureNoCurrentEnrollment(repo(null), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).resolves.toBeUndefined();
  });

  it('maps a unique-constraint style conflict to a 409 business error', () => {
    const error = EnrollmentAlreadyExistsException.forCurrentEnrollment(
      detail({ batchId: BATCH_A }),
      BATCH_B,
    );

    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('STUDENT_ALREADY_ENROLLED');
  });

  it('allows re-enrollment into the same batch after a historical enrollment', async () => {
    const enrollmentRepo = {
      findCurrentDetailByStudentId: jest.fn().mockResolvedValue(null),
      findByStudentAndBatch: jest.fn().mockResolvedValue({
        id: 'old-enroll',
        isCurrent: () => false,
      }),
      findDetailById: jest.fn(),
    } as unknown as EnrollmentRepository;

    await expect(
      domain.ensureNotDuplicate(enrollmentRepo, STUDENT_ID, BATCH_A),
    ).resolves.toBeUndefined();
  });

  it('allows a second current enrollment in a different batch', async () => {
    const enrollmentRepo = {
      findByStudentAndBatch: jest.fn().mockResolvedValue(null),
      findDetailById: jest.fn(),
    } as unknown as EnrollmentRepository;

    await expect(
      domain.ensureNotDuplicate(enrollmentRepo, STUDENT_ID, BATCH_B),
    ).resolves.toBeUndefined();
  });

  it('blocks editing historical cancelled enrollments', () => {
    expect(() =>
      domain.ensureMutable({
        isDeleted: false,
        isCurrent: () => false,
      } as never),
    ).toThrow(EnrollmentHistoricalReadOnlyException);
  });

  it('allows editing current enrollments', () => {
    expect(() =>
      domain.ensureMutable({
        isDeleted: false,
        isCurrent: () => true,
      } as never),
    ).not.toThrow();
  });
});
