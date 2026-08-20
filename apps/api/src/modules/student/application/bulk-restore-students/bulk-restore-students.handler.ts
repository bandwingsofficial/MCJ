import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { ValidationError } from '../errors/validation.error';
import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { parseBulkStudentIds } from '../shared/parse-bulk-student-ids';

import { BulkRestoreStudentsCommand } from './bulk-restore-students.command';
import { BulkRestoreStudentsResult } from './bulk-restore-students.result';

export class BulkRestoreStudentsHandler {
  private readonly logger = new Logger(BulkRestoreStudentsHandler.name);

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: BulkRestoreStudentsCommand,
  ): Promise<BulkRestoreStudentsResult> {
    try {
      this.logger.log('Bulk restore students request received');

      const studentIds = parseBulkStudentIds(command.studentIds);
      const itemResults: BulkStudentItemResult[] = [];
      const studentsToRestore: Student[] = [];

      for (const studentId of studentIds) {
        const student = await this.studentRepo.findById(studentId, true);

        if (!student) {
          itemResults.push({
            studentId,
            success: false,
            message: 'Student not found',
          });
          continue;
        }

        try {
          this.domainService.ensureBranchAccess(
            student,
            command.actorBranchId,
          );
        } catch (error) {
          itemResults.push({
            studentId,
            success: false,
            message:
              error instanceof BaseException
                ? error.message
                : 'Branch access denied',
          });
          continue;
        }

        if (!student.isDeleted) {
          itemResults.push({
            studentId,
            success: true,
            message: 'Student is not archived',
          });
          continue;
        }

        studentsToRestore.push(student);
      }

      for (const student of studentsToRestore) {
        try {
          student.restore(command.updatedBy);
          await this.studentRepo.save(student);

          itemResults.push({
            studentId: student.id,
            success: true,
            message: 'Student restored successfully',
          });

          this.logger.log(`Student restored: ${student.id}`);
        } catch {
          itemResults.push({
            studentId: student.id,
            success: false,
            message: 'Unable to restore student',
          });
        }
      }

      return BulkRestoreStudentsResult.fromItemResults(
        studentIds.length,
        itemResults,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
