import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { parseBulkStudentIds } from '../shared/parse-bulk-student-ids';

import { BulkPermanentDeleteStudentsCommand } from './bulk-permanent-delete-students.command';
import { BulkPermanentDeleteStudentsResult } from './bulk-permanent-delete-students.result';

export class BulkPermanentDeleteStudentsHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteStudentsHandler.name,
  );

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: BulkPermanentDeleteStudentsCommand,
  ): Promise<BulkPermanentDeleteStudentsResult> {
    try {
      this.logger.log(
        'Bulk permanent delete students request received',
      );

      const studentIds = parseBulkStudentIds(command.studentIds);
      const itemResults: BulkStudentItemResult[] = [];

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

        if (!student.isDeleted) {
          itemResults.push({
            studentId,
            success: false,
            message: 'Only archived students can be permanently deleted',
          });
          continue;
        }

        try {
          await this.deleteStudentPermanently(student);

          itemResults.push({
            studentId: student.id,
            success: true,
            message: 'Student permanently deleted successfully',
          });

          this.logger.log(`Student permanently deleted: ${student.id}`);
        } catch {
          itemResults.push({
            studentId: student.id,
            success: false,
            message: 'Unable to permanently delete student',
          });
        }
      }

      return BulkPermanentDeleteStudentsResult.fromItemResults(
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

  private async deleteStudentPermanently(student: Student): Promise<void> {
    const profileImageFileId = student.profileImageFileId;

    await this.studentRepo.deletePermanent(student.id);

    if (profileImageFileId) {
      await this.uploadDomainService.permanentDelete(profileImageFileId);
    }
  }
}
