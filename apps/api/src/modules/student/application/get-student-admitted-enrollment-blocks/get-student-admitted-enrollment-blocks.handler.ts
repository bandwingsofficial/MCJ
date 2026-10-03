import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { STUDENT_TOKENS } from '../../student.tokens';

import { ValidationError } from '../errors/validation.error';
import { parseBulkStudentIds } from '../shared/parse-bulk-student-ids';

import { GetStudentAdmittedEnrollmentBlocksQuery } from './get-student-admitted-enrollment-blocks.query';
import { GetStudentAdmittedEnrollmentBlocksResult } from './get-student-admitted-enrollment-blocks.result';

export class GetStudentAdmittedEnrollmentBlocksHandler {
  private readonly logger = new Logger(
    GetStudentAdmittedEnrollmentBlocksHandler.name,
  );

  constructor(
    @Inject(STUDENT_TOKENS.STUDENT_REPOSITORY)
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(
    query: GetStudentAdmittedEnrollmentBlocksQuery,
  ): Promise<GetStudentAdmittedEnrollmentBlocksResult> {
    try {
      this.logger.log(
        'Get student admitted enrollment blocks request received',
      );

      const studentIds = parseBulkStudentIds(query.studentIds);

      const blocks =
        await this.studentRepo.findAdmittedEnrollmentBlocksByStudentIds(
          studentIds,
        );

      return new GetStudentAdmittedEnrollmentBlocksResult(blocks);
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code ?? ERROR_CODES.VALIDATION_ERROR,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
