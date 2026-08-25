import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { CategoryNotFoundException } from '@modules/course/domain/errors/category-not-found.exception';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@modules/student/domain/errors/branch-not-found.exception';

import { Slug } from '@common/value-objects/slug.vo';
import { BatchTrainer } from '../../domain/entities/batch-trainer.entity';
import { Batch } from '../../domain/entities/batch.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { CreateBatchCommand } from './create-batch.command';

export class CreateBatchHandler {
  private readonly logger = new Logger(CreateBatchHandler.name);

  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly courseRepo: CourseRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly trainerRepo: TrainerRepository,
    private readonly branchRepo: BranchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: CreateBatchCommand,
  ): Promise<GetBatchResult> {
    await this.domainService.ensureCategoryExists(
      this.categoryRepo,
      command.categoryId,
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

    const trainerIds = this.domainService.uniqueIds(
      command.trainerIds,
    );

    if (trainerIds.length > 0) {
      await this.domainService.ensureActiveTrainers(
        this.trainerRepo,
        trainerIds,
      );
    }

    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromName(command.name).getValue();

    const code =
      command.code?.trim()
        ? command.code.trim().toUpperCase()
        : await this.domainService.generateUniqueBatchCode(
            this.batchRepo,
            command.startTime!,
            command.endTime!,
          );

    await this.domainService.ensureCodeIsAvailable(
      this.batchRepo,
      code,
    );
    await this.domainService.ensureSlugIsAvailable(
      this.batchRepo,
      slug,
    );
    this.domainService.validateSchedule({
      startDate: command.startDate,
      endDate: command.endDate ?? command.startDate,
      startTime: command.startTime!,
      endTime: command.endTime!,
      daysOfWeek: command.daysOfWeek,
    });

    const isActive = command.isActive ?? true;
    const displayOrder = isActive
      ? (await this.batchRepo.getMaxDisplayOrder()) + 1
      : null;

    const batchId = randomUUID();
    const batch = Batch.create({
      id: batchId,
      name: command.name,
      code,
      slug,
      description: command.description,
      courseId: command.courseId ?? null,
      categoryId: command.categoryId,
      branchId: command.branchId,
      startDate: command.startDate,
      endDate: command.endDate ?? command.startDate,
      startTime: command.startTime!,
      endTime: command.endTime!,
      daysOfWeek: command.daysOfWeek,
      capacity: command.capacity,
      enrolledCount: command.enrolledCount,
      mode: command.mode,
      classroom: command.classroom,
      meetingLink: command.meetingLink,
      isFeatured: command.isFeatured,
      isActive,
      displayOrder,
      status: command.status,
      trainers: trainerIds.map((trainerId) =>
        BatchTrainer.create({
          id: randomUUID(),
          batchId,
          trainerId,
        }),
      ),
      createdBy: command.createdBy,
    });

    await this.batchRepo.save(batch);

    const savedBatch =
      await this.domainService.ensureExists(
        await this.batchRepo.findById(batch.id),
      );

    this.logger.log(`✅ Batch created: ${batch.id}`);

    return GetBatchResult.fromEntity(savedBatch);
  }
}
