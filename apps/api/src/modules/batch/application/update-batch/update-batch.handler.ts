import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { Slug } from '@common/value-objects/slug.vo';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';

import { UpdateBatchCommand } from './update-batch.command';

export class UpdateBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly courseRepo: CourseRepository,
     private readonly branchRepo: BranchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: UpdateBatchCommand,
  ): Promise<GetBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id),
    );

    if (command.courseId) {
      await this.domainService.ensureCourseExists(
        this.courseRepo,
        command.courseId,
      );
    }

    if (command.branchId) {
  const branch = await this.branchRepo.findById(
    command.branchId,
  );

  if (!branch) {
    throw new BranchNotFoundException(
      command.branchId,
    );
  }
}

    const nextSlug =
      command.slug !== undefined
        ? Slug.create(command.slug).getValue()
        : command.name !== undefined
          ? Slug.fromName(command.name).getValue()
          : batch.slug.getValue();

    if (command.code) {
      await this.domainService.ensureCodeIsAvailable(
        this.batchRepo,
        command.code,
        batch.id,
      );
    }
    await this.domainService.ensureSlugIsAvailable(
      this.batchRepo,
      nextSlug,
      undefined,
      batch.id,
    );

    this.domainService.validateSchedule({
      startDate: command.startDate ?? batch.startDate,
      endDate: command.endDate ?? batch.endDate,
      daysOfWeek: command.daysOfWeek ?? batch.daysOfWeek,
    });

    batch.update({
      name: command.name,
      code: command.code,
      slug: nextSlug,
      description: command.description,
      courseId: command.courseId,
      branchId: command.branchId,
      startDate: command.startDate,
      endDate: command.endDate,
      startTime: command.startTime,
      endTime: command.endTime,
      daysOfWeek: command.daysOfWeek,
      capacity: command.capacity,
      enrolledCount: command.enrolledCount,
      mode: command.mode,
      classroom: command.classroom,
      meetingLink: command.meetingLink,
      isFeatured: command.isFeatured,
      status: command.status,
      updatedBy: command.updatedBy,
    });

    await this.batchRepo.save(batch);

const updatedBatch =
  await this.domainService.ensureExists(
    await this.batchRepo.findById(batch.id),
  );

return GetBatchResult.fromEntity(updatedBatch);
  }
}
