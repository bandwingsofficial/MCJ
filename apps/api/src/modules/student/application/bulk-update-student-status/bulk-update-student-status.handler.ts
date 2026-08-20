import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { ValidationError } from '../errors/validation.error';
import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { parseBulkStudentIds } from '../shared/parse-bulk-student-ids';

import { BulkUpdateStudentStatusCommand } from './bulk-update-student-status.command';
import { BulkUpdateStudentStatusResult } from './bulk-update-student-status.result';

export class BulkUpdateStudentStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateStudentStatusHandler.name,
  );

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: BulkUpdateStudentStatusCommand,
  ): Promise<BulkUpdateStudentStatusResult> {
    try {
      this.logger.log('Bulk update student status request received');

      const studentIds = parseBulkStudentIds(command.studentIds);
      const itemResults: BulkStudentItemResult[] = [];
      const studentsToUpdate: Student[] = [];

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

        if (student.isDeleted) {
          itemResults.push({
            studentId,
            success: false,
            message:
              'Archived students cannot be activated or deactivated',
          });
          continue;
        }

        if (command.isActive === student.isActive) {
          itemResults.push({
            studentId,
            success: true,
            message: `Student is already ${command.isActive ? 'active' : 'inactive'}`,
            isActive: student.isActive,
          });
          continue;
        }

        studentsToUpdate.push(student);
      }

      for (const student of studentsToUpdate) {
        try {
          if (command.isActive) {
            student.activate(command.updatedBy);
          } else {
            student.deactivate(command.updatedBy);
          }

          await this.studentRepo.save(student);

          itemResults.push({
            studentId: student.id,
            success: true,
            message: command.isActive
              ? 'Student activated successfully'
              : 'Student deactivated successfully',
            isActive: student.isActive,
          });

          this.logger.log(`Student status updated: ${student.id}`);
        } catch {
          itemResults.push({
            studentId: student.id,
            success: false,
            message: 'Unable to update student status',
          });
        }
      }

      return BulkUpdateStudentStatusResult.create(
        command.isActive,
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
