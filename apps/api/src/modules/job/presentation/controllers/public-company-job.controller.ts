import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { UploadFileCommand } from '@modules/uploads/application/upload-file/upload-file.command';
import { UploadFileHandler } from '@modules/uploads/application/upload-file/upload-file.handler';

import { CreateJobCommand } from '../../application/create-job/create-job.command';
import { CreateJobHandler } from '../../application/create-job/create-job.handler';
import { JobSource } from '../../domain/enums/job-source.enum';
import { JobWorkMode } from '../../domain/enums/job-work-mode.enum';
import { CreatePublicCompanyJobDto } from '../dtos/create-public-company-job.dto';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@ApiTags('Public Company Jobs')
@Controller('jobs')
export class PublicCompanyJobController {
  constructor(
    private readonly createJobHandler: CreateJobHandler,
    private readonly uploadFileHandler: UploadFileHandler,
  ) {}

  @Post('company-submit')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: CreatePublicCompanyJobDto })
  @ApiResponse({ status: 201, description: 'Company job submission received' })
  @UseInterceptors(
    FileInterceptor('logo', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async submit(
    @Body() dto: CreatePublicCompanyJobDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const deadline = new Date(dto.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(deadline.getTime()) || deadline <= today) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Job expiry date must be a future date.',
        400,
      );
    }

    let companyLogo = dto.companyLogo;

    if (logo) {
      if (!ALLOWED_IMAGE_TYPES.has(logo.mimetype)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Please upload a PNG, JPG, or WEBP image.',
          400,
        );
      }

      const uploaded = await this.uploadFileHandler.execute(
        new UploadFileCommand(
          logo,
          'jobs',
          logo.originalname,
        ),
      );
      companyLogo = uploaded.url;
    }

    const result = await this.createJobHandler.execute(
      new CreateJobCommand({
        title: dto.title,
        companyName: dto.companyName,
        companyEmail: dto.companyEmail,
        companyPhone: dto.companyPhone,
        companyWebsite: dto.companyWebsite,
        companyLogo,
        companyDescription: dto.companyDescription,
        description: dto.description,
        shortDescription: dto.shortDescription,
        location: dto.location,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        isRemote: dto.workMode === JobWorkMode.REMOTE,
        workMode: dto.workMode ?? JobWorkMode.ONSITE,
        employmentType: dto.employmentType,
        workingDays: dto.workingDays,
        category: dto.category,
        department: dto.department,
        minExperience: dto.minExperience,
        maxExperience: dto.maxExperience,
        minSalary: dto.minSalary,
        maxSalary: dto.maxSalary,
        salaryCurrency: dto.salaryCurrency,
        vacancies: dto.vacancies ?? 1,
        applicationDeadline: deadline,
        responsibilities: dto.responsibilities,
        skills: dto.skills,
        preferredSkills: dto.preferredSkills,
        qualifications: dto.qualifications,
        benefits: dto.benefits,
        interviewProcess: dto.interviewProcess,
        source: JobSource.COMPANY_ONBOARDING,
        deferJobNumber: true,
      }),
    );

    return {
      success: true,
      message: 'Job submission received',
      data: {
        id: result.id,
        title: result.title,
        companyName: result.companyName,
        status: result.status,
        createdAt: result.createdAt,
      },
    };
  }
}
