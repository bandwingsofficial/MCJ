import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreateJobApplicationWithStudentCommand } from '../../application/create-job-application-with-student/create-job-application-with-student.command';
import { CreateJobApplicationWithStudentHandler } from '../../application/create-job-application-with-student/create-job-application-with-student.handler';
import { CreateJobApplicationWithStudentDto } from '../dtos/create-job-application-with-student.dto';

@ApiTags('Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class AuthenticatedJobApplicationController {
  constructor(
    private readonly createJobApplicationWithStudentHandler: CreateJobApplicationWithStudentHandler,
  ) {}

  @Post(':slug/student-apply')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
        dateOfBirth: { type: 'string', format: 'date' },
        addressLine1: { type: 'string' },
        addressLine2: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        postalCode: { type: 'string' },
        qualification: { type: 'string' },
        collegeName: { type: 'string' },
        specialization: { type: 'string' },
        passingYear: { type: 'number' },
        parentName: { type: 'string' },
        parentPhone: { type: 'string' },
        notes: { type: 'string' },
        resume: { type: 'string', format: 'binary' },
      },
      required: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'gender',
        'dateOfBirth',
        'addressLine1',
        'city',
        'state',
        'country',
        'postalCode',
        'qualification',
        'collegeName',
        'specialization',
        'passingYear',
        'resume',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted with student profile',
  })
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async applyWithStudent(
    @Param('slug') slug: string,
    @Body() dto: CreateJobApplicationWithStudentDto,
    @UploadedFile() resume: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!resume) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Please upload your resume.',
        400,
      );
    }

    const result =
      await this.createJobApplicationWithStudentHandler.execute(
        new CreateJobApplicationWithStudentCommand(
          user.sub,
          slug,
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.phone,
          dto.gender,
          new Date(dto.dateOfBirth),
          dto.addressLine1,
          dto.addressLine2,
          dto.city,
          dto.state,
          dto.country,
          dto.postalCode,
          dto.qualification,
          dto.collegeName,
          dto.specialization,
          dto.passingYear,
          resume,
        ),
      );

    return {
      success: true,
      message: 'Application submitted successfully',
      data: result,
    };
  }
}
