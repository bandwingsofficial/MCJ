import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import { DurationType } from '@modules/course/domain/enums/duration-type.enum';

import { Slug } from '@common/value-objects/slug.vo';
import { InvalidBatchPricingException } from '../../domain/errors/invalid-batch-pricing.exception';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { normalizeBatchPricingInput } from '../../domain/value-objects/batch-pricing.vo';
import { PrismaBatchCourseRepository } from '../../infrastructure/repositories/prisma-batch-course.repository';
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
    private readonly batchCourseRepo: PrismaBatchCourseRepository,
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
      await this.domainService.ensureActiveCourse(
        this.courseRepo,
        command.courseId,
        { currentCourseId: batch.courseId },
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

    const pricingFieldsTouched =
      command.originalPrice !== undefined ||
      command.discountAmount !== undefined ||
      command.discountedPrice !== undefined ||
      command.currency !== undefined ||
      command.isFree !== undefined;

    let normalizedPricing:
      | ReturnType<typeof normalizeBatchPricingInput>
      | undefined;

    if (pricingFieldsTouched) {
      normalizedPricing = normalizeBatchPricingInput({
        originalPrice:
          command.originalPrice ?? batch.originalPrice.getValue(),
        discountAmount:
          command.discountAmount ?? batch.discountAmount.getValue(),
        discountedPrice:
          command.discountedPrice ?? batch.discountedPrice.getValue(),
        currency: command.currency ?? batch.currency,
        isFree: command.isFree ?? batch.isFree,
      });

      if (
        normalizedPricing.isFree &&
        (normalizedPricing.originalPrice > 0 ||
          normalizedPricing.discountAmount > 0 ||
          normalizedPricing.discountedPrice > 0)
      ) {
        throw new InvalidBatchPricingException(
          'Free batches cannot have pricing values',
        );
      }

      if (
        !normalizedPricing.isFree &&
        normalizedPricing.discountedPrice > normalizedPricing.originalPrice
      ) {
        throw new InvalidBatchPricingException(
          'Discounted price cannot be greater than original price',
        );
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
      originalPrice: normalizedPricing?.originalPrice ?? command.originalPrice,
      discountAmount:
        normalizedPricing?.discountAmount ?? command.discountAmount,
      discountedPrice:
        normalizedPricing?.discountedPrice ?? command.discountedPrice,
      currency: normalizedPricing?.currency ?? command.currency,
      isFree: normalizedPricing?.isFree ?? command.isFree,
      durationValue: command.durationValue,
      durationType:
        command.durationType === undefined
          ? undefined
          : ((command.durationType as DurationType | null) ?? null),
      classroom: command.classroom,
      meetingLink: command.meetingLink,
      isFeatured: command.isFeatured,
      status: command.status,
      updatedBy: command.updatedBy,
    });

    await this.batchRepo.save(batch);

    if (batch.courseId) {
      await this.batchCourseRepo.syncPrimaryCourse({
        batchId: batch.id,
        courseId: batch.courseId,
      });
    }

    const updatedBatch =
      await this.domainService.ensureExists(
        await this.batchRepo.findById(batch.id),
      );

    return GetBatchResult.fromEntity(updatedBatch);
  }
}
