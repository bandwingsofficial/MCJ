import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { JobRepository } from '@modules/job/domain/repositories/job.repository';
import { JobDomainService } from '@modules/job/domain/services/job-domain.service';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { JobApplication } from '../../domain/entities/job-application.entity';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { StudentPortalStudentNotFoundException } from '@modules/student-portal/domain/errors/student-portal-business.exception';

import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { CreateJobApplicationCommand } from './create-job-application.command';

export class CreateJobApplicationHandler {
  private readonly logger = new Logger(
    CreateJobApplicationHandler.name,
  );

  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly jobRepo: JobRepository,
    private readonly studentRepo: StudentRepository,
    private readonly jobDomainService: JobDomainService,
    private readonly domainService: JobApplicationDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateJobApplicationCommand,
  ): Promise<GetJobApplicationResult> {
    const job = this.jobDomainService.ensureExists(
      await this.jobRepo.findById(command.jobId),
    );

    this.jobDomainService.ensureAcceptingApplications(job);

    // Resolve authenticated User -> Student
    const student = await this.studentRepo.findByUserId(
      command.userId,
    );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    await this.domainService.ensureNotDuplicate(
      this.applicationRepo,
      command.jobId,
      student.id,
    );

    const applicationId = randomUUID();
    const applicationNumber =
      await this.applicationRepo.nextApplicationNumber();

    let resumeFileId: string | null = null;

    if (command.resumeFileId) {
      const upload =
        await this.uploadDomainService.attachToEntity({
          uploadId: command.resumeFileId,
          folder: 'jobs',
          entityId: command.jobId,
          subFolder: 'attachments',
          fileName: `${applicationId}.pdf`,
        });

      resumeFileId = upload.id;
    }

    const application = JobApplication.create({
      id: applicationId,
      jobId: command.jobId,
      studentId: student.id,
      applicationNumber,
      applicantName: [student.firstName, student.lastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
      applicantEmail: student.email.getValue(),
      applicantPhone: student.phone.getValue(),
      resumeFileId,
      coverLetter: command.coverLetter,
      currentLocation: command.currentLocation,
      expectedSalary: command.expectedSalary,
      remarks: command.remarks,
      createdBy: command.userId,
    });

    await this.applicationRepo.save(application);

    this.logger.log(
      `Job application created successfully: ${application.id}`,
    );

    return this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(application.id),
    );
  }
}