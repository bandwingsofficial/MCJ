import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentBranchAccessDeniedException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentAlreadyUnenrolledException } from '../../domain/errors/enrollment-already-unenrolled.exception';
import { EnrollmentAlreadyExistsException } from '../../domain/errors/enrollment-already-exists.exception';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';
import { UnenrollEnrollmentHandler } from './unenroll-enrollment.handler';
import { UnenrollEnrollmentCommand } from './unenroll-enrollment.command';

import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import { Batch } from '@modules/batch/domain/entities/batch.entity';
import { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '@modules/batch/domain/enums/day-of-week.enum';

const STUDENT_ID = 'student-1';
const BATCH_A = 'batch-a';
const BATCH_B = 'batch-b';
const BRANCH_A = 'branch-a';
const BRANCH_B = 'branch-b';
const ACTOR_ID = 'actor-1';

function makeEnrollment(
  overrides?: Partial<{
    id: string;
    status: EnrollmentStatus;
    batchId: string;
    branchId: string;
    studentId: string;
  }>,
): Enrollment {
  return Enrollment.create({
    id: overrides?.id ?? 'enroll-1',
    enrollmentNumber: 'ENR-TEST-001',
    studentId: overrides?.studentId ?? STUDENT_ID,
    branchId: overrides?.branchId ?? BRANCH_A,
    categoryId: 'cat-1',
    courseId: 'course-1',
    batchId: overrides?.batchId ?? BATCH_A,
    status: overrides?.status ?? EnrollmentStatus.ADMITTED,
    paidAmount: 0,
    source: EnrollmentSource.ADMIN,
  });
}

function makeBatch(
  id: string,
  branchId: string,
  enrolledCount = 1,
): Batch {
  return Batch.create({
    id,
    name: 'Morning',
    code: 'BCH001',
    branchId,
    startDate: new Date('2026-01-01'),
    startTime: '09:00',
    endTime: '12:00',
    daysOfWeek: [DayOfWeek.MONDAY],
    capacity: 25,
    enrolledCount,
    mode: CourseMode.OFFLINE,
    status: BatchStatus.ACTIVE,
  });
}

function makeDetail(enrollment: Enrollment) {
  return {
    id: enrollment.id,
    enrollmentNumber: enrollment.enrollmentNumber.getValue(),
    status: enrollment.status,
    paymentStatus: PaymentStatus.UNPAID,
    source: EnrollmentSource.ADMIN,
    feeAmount: 0,
    discountAmount: 0,
    finalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    admissionDate: null,
    joiningDate: null,
    expectedCompletionDate: null,
    remarks: enrollment.remarks,
    rejectionReason: null,
    isActive: enrollment.isActive,
    isDeleted: false,
    deletedAt: null,
    student: {
      id: enrollment.studentId,
      studentCode: 'STU0001',
      firstName: 'Akshay',
      lastName: 'Badiger',
      email: null,
      phone: null,
      gender: null,
      qualification: null,
      profileImageUrl: null,
      status: 'ADMITTED',
      isActive: true,
    },
    branch: {
      id: BRANCH_A,
      branchName: 'Malleswaram',
      branchCode: 'MLSW',
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
      pricing: {
        originalPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
        discountedPrice: 0,
        currency: 'INR',
        isFree: true,
      },
    },
    batch: {
      id: enrollment.batchId,
      name: 'morning',
      code: 'BCH0001',
      startDate: new Date(),
      endDate: null,
      status: BatchStatus.ACTIVE,
      mode: CourseMode.OFFLINE,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('UnenrollEnrollmentHandler', () => {
  let enrollmentRepo: jest.Mocked<EnrollmentRepository>;
  let batchRepo: jest.Mocked<BatchRepository>;
  let sideEffects: jest.Mocked<EnrollmentSideEffectsService>;
  let handler: UnenrollEnrollmentHandler;
  let savedEnrollment: Enrollment | null;

  beforeEach(() => {
    savedEnrollment = null;

    enrollmentRepo = {
      findById: jest.fn(),
      findDetailById: jest.fn(),
      save: jest.fn(async (enrollment: Enrollment) => {
        savedEnrollment = enrollment;
      }),
      findCurrentDetailByStudentId: jest.fn(),
      findCurrentByStudentId: jest.fn(),
      findByStudentAndBatch: jest.fn(),
      findByEnrollmentNumber: jest.fn(),
    } as unknown as jest.Mocked<EnrollmentRepository>;

    batchRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<BatchRepository>;

    sideEffects = {
      apply: jest.fn(),
      releaseSeat: jest.fn(),
      assertCapacityForTransition: jest.fn(),
      transferSeat: jest.fn(),
    } as unknown as jest.Mocked<EnrollmentSideEffectsService>;

    handler = new UnenrollEnrollmentHandler(
      enrollmentRepo,
      batchRepo,
      new EnrollmentDomainService(),
      sideEffects,
    );
  });

  // TEST 13: Active enrollment → Unenroll → SUCCESS
  it('unenrolls an active enrollment successfully', async () => {
    const enrollment = makeEnrollment({ status: EnrollmentStatus.ACTIVE });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_A, BRANCH_A, 1));
    enrollmentRepo.findDetailById.mockImplementation(async () =>
      makeDetail(savedEnrollment ?? enrollment),
    );

    const result = await handler.execute(
      new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID),
    );

    expect(result.status).toBe(EnrollmentStatus.CANCELLED);
    expect(savedEnrollment?.status).toBe(EnrollmentStatus.CANCELLED);
    expect(savedEnrollment?.isActive).toBe(false);
    expect(sideEffects.apply).toHaveBeenCalledWith(
      expect.objectContaining({ status: EnrollmentStatus.CANCELLED }),
      EnrollmentStatus.ACTIVE,
      ACTOR_ID,
    );
  });

  // TEST 18: Already cancelled → business error
  it('returns a business error when enrollment is already cancelled', async () => {
    const enrollment = makeEnrollment({
      status: EnrollmentStatus.CANCELLED,
    });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_A, BRANCH_A));

    await expect(
      handler.execute(new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID)),
    ).rejects.toBeInstanceOf(EnrollmentAlreadyUnenrolledException);
    expect(enrollmentRepo.save).not.toHaveBeenCalled();
  });

  // TEST 19: Branch manager can unenroll own branch student
  it('allows unenrollment when batch belongs to the actor branch', async () => {
    const enrollment = makeEnrollment({ status: EnrollmentStatus.ADMITTED });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_A, BRANCH_A));
    enrollmentRepo.findDetailById.mockImplementation(async () =>
      makeDetail(savedEnrollment ?? enrollment),
    );

    await expect(
      handler.execute(
        new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID, BRANCH_A),
      ),
    ).resolves.toMatchObject({ status: EnrollmentStatus.CANCELLED });
  });

  // TEST 20: Branch manager cannot unenroll another branch student
  it('denies unenrollment when batch belongs to another branch', async () => {
    const enrollment = makeEnrollment({
      status: EnrollmentStatus.ADMITTED,
      branchId: BRANCH_B,
      batchId: BATCH_B,
    });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_B, BRANCH_B));

    await expect(
      handler.execute(
        new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID, BRANCH_A),
      ),
    ).rejects.toBeInstanceOf(EnrollmentBranchAccessDeniedException);
  });

  // TEST 22: Historical cancelled enrollment remains in database (soft save, not delete)
  it('persists cancellation instead of deleting the enrollment record', async () => {
    const enrollment = makeEnrollment({ status: EnrollmentStatus.ADMITTED });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_A, BRANCH_A));
    enrollmentRepo.findDetailById.mockImplementation(async () =>
      makeDetail(savedEnrollment ?? enrollment),
    );

    await handler.execute(new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID));

    expect(enrollmentRepo.save).toHaveBeenCalledTimes(1);
    expect(savedEnrollment?.isDeleted).toBe(false);
    expect(savedEnrollment?.status).toBe(EnrollmentStatus.CANCELLED);
  });

  // TEST 25: Batch seat side effects invoked on unenroll
  it('releases the batch seat through side effects', async () => {
    const enrollment = makeEnrollment({ status: EnrollmentStatus.ADMITTED });
    enrollmentRepo.findById.mockResolvedValue(enrollment);
    batchRepo.findById.mockResolvedValue(makeBatch(BATCH_A, BRANCH_A, 1));
    enrollmentRepo.findDetailById.mockImplementation(async () =>
      makeDetail(savedEnrollment ?? enrollment),
    );

    await handler.execute(new UnenrollEnrollmentCommand('enroll-1', ACTOR_ID));

    expect(sideEffects.apply).toHaveBeenCalledWith(
      expect.any(Enrollment),
      EnrollmentStatus.ADMITTED,
      ACTOR_ID,
    );
  });
});

describe('Unenroll enables re-enrollment (one active enrollment rule)', () => {
  const domainService = new EnrollmentDomainService();

  // TEST 16 / 23: Student can enroll after being unenrolled
  it('allows a new enrollment once the prior one is cancelled', async () => {
    const enrollmentRepo = {
      findCurrentDetailByStudentId: jest.fn().mockResolvedValue(null),
      findByStudentAndBatch: jest.fn().mockResolvedValue(null),
      findByEnrollmentNumber: jest.fn().mockResolvedValue(null),
    } as unknown as EnrollmentRepository;

    await expect(
      domainService.ensureNoCurrentEnrollment(enrollmentRepo, STUDENT_ID),
    ).resolves.toBeUndefined();
  });

  // TEST 17: Student cannot have two active enrollments
  it('blocks a second active enrollment while one is current', async () => {
    const enrollmentRepo = {
      findCurrentDetailByStudentId: jest.fn().mockResolvedValue({
        id: 'enroll-1',
        status: EnrollmentStatus.ADMITTED,
        student: {
          id: STUDENT_ID,
          studentCode: 'STU0001',
          firstName: 'Akshay',
          lastName: 'Badiger',
        },
        branch: {
          id: BRANCH_A,
          branchName: 'Malleswaram',
          branchCode: 'MLSW',
        },
        batch: { id: BATCH_A, name: 'morning', code: 'BCH0001' },
        course: { id: 'course-1', title: 'CA Foundation' },
      }),
    } as unknown as EnrollmentRepository;

    await expect(
      domainService.ensureNoCurrentEnrollment(enrollmentRepo, STUDENT_ID, {
        intendedBatchId: BATCH_B,
      }),
    ).rejects.toBeInstanceOf(EnrollmentAlreadyExistsException);
  });
});

describe('EnrollmentSideEffectsService seat release', () => {
  // TEST 14 / 15 / 25: seat count decreases after unenroll
  it('decrements batch enrolledCount when an occupying enrollment is cancelled', async () => {
    const batch = makeBatch(BATCH_A, BRANCH_A, 1);
    const batchRepo = {
      findById: jest.fn().mockResolvedValue(batch),
      save: jest.fn(async (entity: Batch) => entity),
    } as unknown as BatchRepository;

    const studentRepo = {
      findById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    } as unknown as import('@modules/student/domain/repositories/student.repository').StudentRepository;

    const sideEffects = new EnrollmentSideEffectsService(
      batchRepo,
      studentRepo,
      new EnrollmentDomainService(),
    );

    const enrollment = makeEnrollment({ status: EnrollmentStatus.CANCELLED });

    await sideEffects.apply(
      enrollment,
      EnrollmentStatus.ADMITTED,
      ACTOR_ID,
    );

    expect(batch.enrolledCount).toBe(0);
    expect(batchRepo.save).toHaveBeenCalled();
  });
});
