import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { Slug } from '@common/value-objects/slug.vo';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';
import { ensureBatchSelectableForAssignment } from '../../domain/utils/batch-selection.util';

import { UpdateBatchCommand } from './update-batch.command';

export class UpdateBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly courseRepo: CourseRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly branchRepo: BranchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: UpdateBatchCommand,
  ): Promise<GetBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id),
    );

    if (command.categoryId) {
      await this.domainService.ensureCategoryExists(
        this.categoryRepo,
        command.categoryId,
      );
    }

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

      // New branch assignment must reject completed/expired batches.
      if (command.branchId !== batch.branchId) {
        ensureBatchSelectableForAssignment(batch);
      }
    }

    const nextSlug =
      command.slug !== undefined
        ? Slug.create(command.slug).getValue()
        : command.name !== undefined
          ? Slug.fromName(command.name).getValue()
          : batch.slug.getValue();

    const batchCodeValue =
      typeof batch.code === "string" ? batch.code : batch.code.getValue();

    const nextStartTime = command.startTime ?? batch.startTime;
    const nextEndTime = command.endTime ?? batch.endTime;

    this.domainService.validateSchedule({
      startDate: command.startDate ?? batch.startDate,
      endDate: command.endDate ?? batch.endDate ?? batch.startDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      daysOfWeek: command.daysOfWeek ?? batch.daysOfWeek,
    });

    const timesChanged =
      (command.startTime !== undefined &&
        command.startTime !== batch.startTime) ||
      (command.endTime !== undefined &&
        command.endTime !== batch.endTime);

    let nextCode = command.code?.trim().toUpperCase() ?? batchCodeValue;

    if (timesChanged) {
      nextCode = await this.domainService.generateUniqueBatchCode(
        this.batchRepo,
        nextStartTime,
        nextEndTime,
      );
    }

    if (nextCode !== batchCodeValue) {
      await this.domainService.ensureCodeIsAvailable(
        this.batchRepo,
        nextCode,
        batch.id,
      );
    } else if (command.code) {
      await this.domainService.ensureCodeIsAvailable(
        this.batchRepo,
        nextCode,
        batch.id,
      );
    }

    await this.domainService.ensureSlugIsAvailable(
      this.batchRepo,
      nextSlug,
      undefined,
      batch.id,
    );

    batch.update({
      name: command.name,
      code: nextCode,
      slug: nextSlug,
      description: command.description,
      courseId: command.courseId,
      categoryId: command.categoryId,
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
