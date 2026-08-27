import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { JobRepository } from '@modules/job/domain/repositories/job.repository';
import { JobDomainService } from '@modules/job/domain/services/job-domain.service';
import { UploadFileCommand } from '@modules/uploads/application/upload-file/upload-file.command';
import { UploadFileHandler } from '@modules/uploads/application/upload-file/upload-file.handler';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { JobApplication } from '../../domain/entities/job-application.entity';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { CreatePublicJobApplicationCommand } from './create-public-job-application.command';

const ALLOWED_RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export class CreatePublicJobApplicationHandler {
  private readonly logger = new Logger(
    CreatePublicJobApplicationHandler.name,
  );

  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly jobRepo: JobRepository,
    private readonly jobDomainService: JobDomainService,
    private readonly domainService: JobApplicationDomainService,
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreatePublicJobApplicationCommand,
  ): Promise<GetJobApplicationResult> {
    const job = this.jobDomainService.ensureExists(
      await this.jobRepo.findBySlug(command.slug),
    );

    this.jobDomainService.ensureAcceptingApplications(job);

    await this.domainService.ensureNotDuplicateEmail(
      this.applicationRepo,
      job.id,
      command.applicantEmail,
    );

    if (!command.resume) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Please upload your resume.',
        400,
      );
    }

    this.assertResume(command.resume);

    const applicationId = randomUUID();
    const applicationNumber =
      await this.applicationRepo.nextApplicationNumber();

    const uploaded = await this.uploadFileHandler.execute(
      new UploadFileCommand(
        command.resume,
        'jobs',
        command.resume.originalname,
        job.id,
        undefined,
        undefined,
        undefined,
      ),
    );

    const attached = await this.uploadDomainService.attachToEntity({
      uploadId: uploaded.fileId,
      folder: 'jobs',
      entityId: job.id,
      subFolder: 'applications',
      fileName: `${applicationId}-${command.resume.originalname}`,
    });

    const application = JobApplication.create({
      id: applicationId,
      jobId: job.id,
      studentId: null,
      applicationNumber,
      applicantName: command.applicantName,
      applicantEmail: command.applicantEmail,
      applicantPhone: command.applicantPhone,
      highestQualification: command.highestQualification,
      yearsOfExperience: command.yearsOfExperience,
      resumeFileId: attached.id,
      coverLetter: command.coverLetter,
      currentLocation: command.currentLocation,
      remarks: command.remarks,
    });

    await this.applicationRepo.save(application);

    this.logger.log(
      `Public job application created: ${application.applicationNumber}`,
    );

    return this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(application.id),
    );
  }

  private assertResume(file: Express.Multer.File) {
    const mime = file.mimetype.trim().toLowerCase();
    if (!ALLOWED_RESUME_MIME_TYPES.has(mime)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Resume must be a PDF, DOC, or DOCX file.',
        400,
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Resume must be 10MB or smaller.',
        400,
      );
    }
  }
}
