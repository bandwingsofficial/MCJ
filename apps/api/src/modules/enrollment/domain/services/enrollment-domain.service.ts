import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { Batch } from '@modules/batch/domain/entities/batch.entity';
import { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { Branch } from '@modules/branch/domain/entities/branch.entity';
import { BranchStatus } from '@modules/branch/domain/enums/branch-status.enum';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { Category } from '@modules/category/domain/entities/category.entity';
import { CategoryStatus } from '@modules/category/domain/enums/category-status.enum';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { Course } from '@modules/course/domain/entities/course.entity';
import { CourseStatus } from '@modules/course/domain/enums/course-status.enum';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { Student } from '@modules/student/domain/entities/student.entity';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';

import { ERROR_CODES } from '@common/constants/error-codes';

import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { BatchFullException } from '../errors/batch-full.exception';
import {
  BatchCancelledException,
  BatchCompletedException,
  BatchCourseMismatchException,
  BatchDeletedException,
  BatchInactiveException,
  BatchNotFoundException,
  BranchDeletedException,
  BranchInactiveException,
  BranchNotFoundException,
  CategoryBranchMismatchException,
  CategoryDeletedException,
  CategoryInactiveException,
  CategoryNotFoundException,
  CourseArchivedException,
  CourseCategoryMismatchException,
  CourseDeletedException,
  CourseInactiveException,
  CourseInDraftException,
  CourseNotFoundException,
  EnrollmentBranchAccessDeniedException,
  EnrollmentDeletedException,
  EnrollmentNotDeletedException,
  InvalidStatusTransitionException,
  StudentBranchMismatchException,
  StudentDeletedException,
  StudentInactiveException,
  StudentNotFoundException,
} from '../errors/enrollment-business.exception';
import { EnrollmentAlreadyExistsException } from '../errors/enrollment-already-exists.exception';
import { EnrollmentNotFoundException } from '../errors/enrollment-not-found.exception';
import type {
  EnrollmentDetailView,
  EnrollmentRepository,
} from '../repositories/enrollment.repository';

export interface EnrollmentHierarchy {
  student: Student;
  branch: Branch;
  branchId: string;
  category: Category | null;
  categoryId: string;
  course: Course;
  courseId: string;
  batch: Batch;
}

@Injectable()
export class EnrollmentDomainService {
  ensureExists(enrollment: Enrollment | null): Enrollment {
    if (!enrollment) {
      throw new EnrollmentNotFoundException();
    }

    return enrollment;
  }

  ensureDetailExists(
    enrollment: EnrollmentDetailView | null,
  ): EnrollmentDetailView {
    if (!enrollment) {
      throw new EnrollmentNotFoundException();
    }

    return enrollment;
  }

  ensureNotDeleted(enrollment: Enrollment): void {
    if (enrollment.isDeleted) {
      throw new EnrollmentDeletedException();
    }
  }

  ensureDeleted(enrollment: Enrollment): void {
    if (!enrollment.isDeleted) {
      throw new EnrollmentNotDeletedException();
    }
  }

  ensureValidStatusTransition(
    from: EnrollmentStatus,
    to: EnrollmentStatus,
  ): void {
    if (from === to) {
      return;
    }

    const allowedTransitions: Record<
      EnrollmentStatus,
      EnrollmentStatus[]
    > = {
      [EnrollmentStatus.PENDING]: [EnrollmentStatus.ADMITTED],
      [EnrollmentStatus.ADMITTED]: [
        EnrollmentStatus.ACTIVE,
        EnrollmentStatus.CANCELLED,
      ],
      [EnrollmentStatus.ACTIVE]: [
        EnrollmentStatus.COMPLETED,
        EnrollmentStatus.DROPPED,
      ],
      [EnrollmentStatus.COMPLETED]: [],
      [EnrollmentStatus.DROPPED]: [],
      [EnrollmentStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[from].includes(to)) {
      throw new InvalidStatusTransitionException(from, to);
    }
  }

  ensureBranchAccess(
    enrollment: Enrollment,
    branchId?: string | null,
  ): void {
    this.ensureBranchAccessById(enrollment.branchId, branchId);
  }

  ensureBranchAccessById(
    enrollmentBranchId: string,
    branchId?: string | null,
  ): void {
    if (!branchId || enrollmentBranchId === branchId) {
      return;
    }

    throw new EnrollmentBranchAccessDeniedException();
  }

  async ensureEnrollmentNumberIsAvailable(
    enrollmentRepo: EnrollmentRepository,
    enrollmentNumber: string,
    excludeId?: string,
  ): Promise<void> {
    const existing =
      await enrollmentRepo.findByEnrollmentNumber(
        enrollmentNumber.trim().toUpperCase(),
        true,
      );

    if (existing && existing.id !== excludeId) {
      throw new EnrollmentAlreadyExistsException(
        ERROR_CODES.ENROLLMENT_ALREADY_EXISTS,
        'Enrollment number already exists',
      );
    }
  }

  async ensureNotDuplicate(
    enrollmentRepo: EnrollmentRepository,
    studentId: string,
    batchId: string,
  ): Promise<void> {
    const existing =
      await enrollmentRepo.findByStudentAndBatch(
        studentId,
        batchId,
        true,
      );

    if (existing) {
      throw new EnrollmentAlreadyExistsException();
    }
  }

  async generateUniqueEnrollmentNumber(
    enrollmentRepo: EnrollmentRepository,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const enrollmentNumber = `ENR-${randomUUID()
        .replace(/-/g, '')
        .slice(0, 10)
        .toUpperCase()}`;

      const existing =
        await enrollmentRepo.findByEnrollmentNumber(
          enrollmentNumber,
          true,
        );

      if (!existing) {
        return enrollmentNumber;
      }
    }

    throw new EnrollmentAlreadyExistsException(
      ERROR_CODES.ENROLLMENT_ALREADY_EXISTS,
      'Unable to generate unique enrollment number',
    );
  }

  // Validates the Branch → Category → Course → Batch → Student hierarchy.
  // The branch, course and category are derived from the batch — the client
  // never supplies them, so they cannot be spoofed.
  async validateHierarchy(
    repos: {
      studentRepo: StudentRepository;
      branchRepo: BranchRepository;
      categoryRepo: CategoryRepository;
      courseRepo: CourseRepository;
      batchRepo: BatchRepository;
    },
    params: {
      studentId: string;
      batchId: string;
    },
  ): Promise<EnrollmentHierarchy> {
    const batch = await repos.batchRepo.findById(
      params.batchId,
      true,
    );
    if (!batch) {
      throw new BatchNotFoundException();
    }

    if (batch.isDeleted) {
      throw new BatchDeletedException();
    }

    if (!batch.isActive) {
      throw new BatchInactiveException();
    }

    if (batch.status === BatchStatus.COMPLETED) {
      throw new BatchCompletedException();
    }

    if (batch.status === BatchStatus.CANCELLED) {
      throw new BatchCancelledException();
    }

    if (!batch.branchId) {
      throw new BranchNotFoundException();
    }

    const branchId = batch.branchId;
    const courseId = batch.courseId;

    const course = await repos.courseRepo.findById(courseId, true);
    if (!course) {
      throw new CourseNotFoundException();
    }

    if (course.isDeleted) {
      throw new CourseDeletedException();
    }

    if (course.status === CourseStatus.DRAFT) {
      throw new CourseInDraftException();
    }

    if (course.status === CourseStatus.ARCHIVED) {
      throw new CourseArchivedException();
    }

    if (course.status === CourseStatus.INACTIVE) {
      throw new CourseInactiveException();
    }

    // Batch at branch is the authoritative proof of course availability.
    // course.branchIds may be out of sync with active batch offerings.

    if (batch.courseId !== course.id) {
      throw new BatchCourseMismatchException();
    }

    const categoryId = course.categoryId?.trim() || null;

    let category: Category | null = null;

    if (categoryId) {
      category = await repos.categoryRepo.findById(categoryId, true);
      if (!category) {
        throw new CategoryNotFoundException();
      }

      if (category.isDeleted) {
        throw new CategoryDeletedException();
      }

      if (category.status !== CategoryStatus.ACTIVE) {
        throw new CategoryInactiveException();
      }
    }

    const branch =
      await repos.branchRepo.findByIdIncludingDeleted(branchId);
    if (!branch) {
      throw new BranchNotFoundException();
    }

    if (branch.deletedAt) {
      throw new BranchDeletedException();
    }

    if (branch.status !== BranchStatus.ACTIVE) {
      throw new BranchInactiveException();
    }

    const student = await repos.studentRepo.findById(
      params.studentId,
      true,
    );
    if (!student) {
      throw new StudentNotFoundException();
    }

    if (student.isDeleted) {
      throw new StudentDeletedException();
    }

    if (!student.isActive) {
      throw new StudentInactiveException();
    }

    // Hierarchy alignment
    if (student.branchId !== branchId) {
      throw new StudentBranchMismatchException();
    }

    // Batch is the source of truth for branch + course alignment.
    // If an active batch exists for this branch and course, the offering is valid
    // even when the legacy branchCategory junction row is missing.
    const batchProvesBranchOffering =
      batch.branchId === branchId && batch.courseId === course.id;

    const isCategoryAssigned = category
      ? await repos.categoryRepo.isAssignedToBranch(category.id, branchId)
      : true;

    if (
      category &&
      !isCategoryAssigned &&
      !batchProvesBranchOffering
    ) {
      throw new CategoryBranchMismatchException();
    }

    if (category && course.categoryId !== category.id) {
      throw new CourseCategoryMismatchException();
    }

    return {
      student,
      branch,
      branchId,
      category,
      categoryId: categoryId ?? course.categoryId,
      course,
      courseId,
      batch,
    };
  }

  ensureBatchHasCapacity(batch: Batch): void {
    if (batch.enrolledCount >= batch.capacity.getValue()) {
      throw new BatchFullException();
    }
  }

  async resolveDefaultBranchId(
    branchRepo: BranchRepository,
  ): Promise<string> {
    const branches = await branchRepo.findAll({ take: 1 });

    if (!branches.length) {
      throw new BranchNotFoundException();
    }

    return branches[0].id;
  }

  // Maps an enrollment status to its impact on the linked student.
  resolveStudentStatus(
    status: EnrollmentStatus,
  ): StudentStatus | null {
    switch (status) {
      case EnrollmentStatus.ADMITTED:
      case EnrollmentStatus.ACTIVE:
        return StudentStatus.ADMITTED;
      case EnrollmentStatus.COMPLETED:
        return StudentStatus.COMPLETED;
      case EnrollmentStatus.DROPPED:
        return StudentStatus.DROPPED;
      default:
        return null;
    }
  }
}
