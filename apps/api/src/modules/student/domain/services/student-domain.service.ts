import { Injectable } from '@nestjs/common';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BranchStatus } from '@modules/branch/domain/enums/branch-status.enum';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Student } from '../entities/student.entity';
import type { StudentRepository } from '../repositories/student.repository';
import { BranchNotFoundException } from '../errors/branch-not-found.exception';
import { formatStudentCode } from '../utils/student-code.util';

@Injectable()
export class StudentDomainService {
  async ensureExists(student: Student | null): Promise<Student> {
    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student could not be found.',
        404,
      );
    }

    return student;
  }

  async ensureEmailIsAvailable(
    studentRepo: StudentRepository,
    email?: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!email) return;

    const existing = await studentRepo.findByEmail(
      email.trim().toLowerCase(),
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.STUDENT_EMAIL_EXISTS,
        'A student with this email already exists. Use a different email address.',
        409,
        { field: 'email' },
      );
    }
  }

  async ensurePhoneIsAvailable(
    studentRepo: StudentRepository,
    phone?: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!phone) return;

    const normalized = phone.replace(/[\s-]/g, '').trim();
    const existing = await studentRepo.findByPhone(normalized, true);

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.STUDENT_PHONE_EXISTS,
        'A student with this phone number already exists. Use a different phone number.',
        409,
        { field: 'phone' },
      );
    }
  }

  async ensureStudentCodeIsAvailable(
    studentRepo: StudentRepository,
    studentCode: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await studentRepo.findByStudentCode(
      studentCode.trim().toUpperCase(),
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.STUDENT_CODE_EXISTS,
        'A student with this student code already exists. Use a different code.',
        409,
        { field: 'studentCode' },
      );
    }
  }

  async ensureBranchExists(
    branchRepo: BranchRepository,
    branchId: string,
  ): Promise<void> {
    const branch = await branchRepo.findById(branchId);

    if (!branch) {
      throw new BranchNotFoundException(branchId);
    }
  }

  ensureBranchAccess(student: Student, branchId?: string | null): void {
    if (!branchId || student.branchId === branchId) {
      return;
    }

    throw new BaseException(
      ERROR_CODES.BRANCH_ACCESS_DENIED,
      'You do not have access to this student branch.',
      403,
    );
  }

  async resolveDefaultBranchId(branchRepo: BranchRepository): Promise<string> {
    const branches = await branchRepo.findAll({
      status: BranchStatus.ACTIVE,
      take: 1,
    });

    if (!branches.length) {
      throw new BaseException(
        ERROR_CODES.BRANCH_NOT_FOUND,
        'No active branch is available. Create or activate a branch first.',
        404,
      );
    }

    return branches[0].id;
  }

  async generateUniqueStudentCode(
    studentRepo: StudentRepository,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const maxNumber = await studentRepo.getMaxStudentCodeNumber();
      const studentCode = formatStudentCode(maxNumber + 1 + attempt);

      const existing = await studentRepo.findByStudentCode(studentCode, true);

      if (!existing) {
        return studentCode;
      }
    }

    throw new BaseException(
      ERROR_CODES.STUDENT_CODE_EXISTS,
      'Unable to generate a unique student code. Please try again.',
      409,
      { field: 'studentCode' },
    );
  }
}
