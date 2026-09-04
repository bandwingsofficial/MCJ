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
      isActive: true,
    },
    branch: {
      id: 'branch-1',
      branchName: overrides?.branchName ?? 'Branch A',
      branchCode: 'BR-A',
    },
    category: { id: 'cat-1', name: 'CA', slug: 'ca' },
    course: {
      id: 'course-1',
      title: 'CA Foundation',
      slug: 'ca-foundation',
      tagline: null,
      shortDescription: null,
      duration: null,
      durationType: null,
      level: 'BEGINNER',
      language: 'EN',
      thumbnailUrl: null,
      status: 'ACTIVE',
      averageRating: 0,
      totalReviews: 0,
    },
    batch: {
      id: batchId,
      name: batchId === BATCH_A ? 'Morning' : 'Evening',
      code: batchId === BATCH_A ? 'BCH-A' : 'BCH-B',
      slug: 'batch',
      description: null,
      startDate: new Date(),
      endDate: null,
      startTime: '09:00',
      endTime: '11:00',
      daysOfWeek: [],
      capacity: 30,
      enrolledCount: 1,
      mode: 'OFFLINE',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('EnrollmentDomainService one-current-enrollment rule', () => {
  const domain = new EnrollmentDomainService();

  function repo(
    current: EnrollmentDetailView | null,
    sameBatch?: { id: string } | null,
  ): EnrollmentRepository {
    return {
      findCurrentDetailByStudentId: jest.fn().mockResolvedValue(current),
      findByStudentAndBatch: jest.fn().mockResolvedValue(sameBatch ?? null),
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

    try {
      await domain.ensureNoCurrentEnrollment(repo(existing), STUDENT_ID, {
        intendedBatchId: BATCH_A,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EnrollmentAlreadyExistsException);
      expect((error as Error).message).toBe(
        'Student is already actively enrolled in Malleswaram - Morning batch. A student can have only one active enrollment at a time.',
      );
    }
  });

  it('rejects enrollment into another batch in the same branch', async () => {
    const existing = detail({ batchId: BATCH_A, branchName: 'Malleswaram' });

    await expect(
      domain.ensureNoCurrentEnrollment(repo(existing), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).rejects.toBeInstanceOf(EnrollmentAlreadyExistsException);

    try {
      await domain.ensureNoCurrentEnrollment(repo(existing), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      });
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 409,
        metadata: {
          existingEnrollment: expect.objectContaining({
            batch: expect.objectContaining({ id: BATCH_A }),
            branch: expect.objectContaining({ branchName: 'Malleswaram' }),
            course: expect.objectContaining({ title: 'CA Foundation' }),
          }),
        },
      });
      expect((error as Error).message).toBe(
        'Student is already actively enrolled in Malleswaram - Morning batch. A student can have only one active enrollment at a time.',
      );
    }
  });

  it('rejects enrollment into a batch in another branch', async () => {
    const existing = detail({
      batchId: BATCH_A,
      branchName: 'Rajinagar',
    });

    await expect(
      domain.ensureNoCurrentEnrollment(repo(existing), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      metadata: {
        existingEnrollment: expect.objectContaining({
          branch: expect.objectContaining({ branchName: 'Rajinagar' }),
        }),
      },
    });
  });

  it('does not treat a completed enrollment as current', async () => {
    await expect(
      domain.ensureNoCurrentEnrollment(repo(null), STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).resolves.toBeUndefined();

    expect(EnrollmentStatus.COMPLETED).toBe('COMPLETED');
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
      findByStudentAndBatch: jest.fn().mockResolvedValue({ id: 'old-enroll' }),
      findDetailById: jest.fn(),
    } as unknown as EnrollmentRepository;

    await expect(
      domain.ensureNotDuplicate(enrollmentRepo, STUDENT_ID, BATCH_A),
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
