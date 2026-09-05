import { Slug } from '@common/value-objects/slug.vo';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DurationType } from '@modules/course/domain/enums/duration-type.enum';
import { Price } from '@modules/course/domain/value-objects/price.vo';
import { BatchStatus } from '../enums/batch-status.enum';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { calculateBatchLifecycleStatus } from '../utils/batch-lifecycle-status.util';
import { BatchCode } from '../value-objects/batch-code.vo';
import { BatchName } from '../value-objects/batch-name.vo';
import {
  buildBatchPricing,
  type BatchPricingSnapshot,
} from '../value-objects/batch-pricing.vo';
import { Capacity } from '../value-objects/capacity.vo';
import { Classroom } from '../value-objects/classroom.vo';
import { BatchTrainer } from './batch-trainer.entity';

export class Batch {
  private constructor(
    public readonly id: string,
    public name: BatchName,
    public code: BatchCode,
    public slug: Slug,
    public description: string | null,
    public course: {
      id: string;
      title: string;
      code?: string | null;
      category?: { id: string; name: string } | null;
    } | null,

    public branch: {
      id: string;
      branchName: string;
      branchCode: string;
    } | null,

    public category: {
      id: string;
      name: string;
    } | null,
    public courseId: string | null,
    public categoryId: string | null,
    public branchId: string | null,
    public startDate: Date,
    public endDate: Date | null,
    public startTime: string,
    public endTime: string,
    public daysOfWeek: DayOfWeek[],
    public capacity: Capacity,
    public enrolledCount: number,
    public mode: CourseMode,
    public durationValue: number | null,
    public durationType: DurationType | null,
    public originalPrice: Price,
    public discountAmount: Price,
    public discountedPrice: Price,
    public currency: string,
    public isFree: boolean,
    public classroom: Classroom,
    public meetingLink: string | null,
    public isFeatured: boolean,
    public isActive: boolean,
    public displayOrder: number | null,
    public status: BatchStatus,
    public trainers: BatchTrainer[],
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: BatchCreateParams): Batch {
    const pricing = buildBatchPricing({
      originalPrice: params.originalPrice ?? 0,
      discountAmount: params.discountAmount ?? 0,
      discountedPrice: params.discountedPrice ?? 0,
      currency: params.currency,
      isFree: params.isFree,
    });

    return new Batch(
      params.id,
      BatchName.create(params.name),
      BatchCode.create(params.code),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromName(params.name),
      params.description ?? null,

      params.course ?? null,
      params.branch ?? null,
      params.category ?? null,

      params.courseId ?? null,
      params.categoryId ?? null,
      params.branchId ?? null,
      params.startDate,
      params.endDate ?? null,
      params.startTime,
      params.endTime,
      params.daysOfWeek,
      Capacity.create(params.capacity),
      params.enrolledCount ?? 0,
      params.mode ?? CourseMode.OFFLINE,
      params.durationValue ?? null,
      params.durationType ?? null,
      Price.create(pricing.originalPrice),
      Price.create(pricing.discountAmount),
      Price.create(pricing.discountedPrice),
      pricing.currency,
      pricing.isFree,
      Classroom.create(params.classroom),
      params.meetingLink ?? null,
      params.isFeatured ?? false,
      params.isActive ?? true,
      params.displayOrder ?? null,
      params.status ?? BatchStatus.UPCOMING,
      params.trainers ?? [],
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: BatchReconstituteParams): Batch {
    return new Batch(
      params.id,
      BatchName.create(params.name),
      BatchCode.create(params.code),
      Slug.create(params.slug),
      params.description,

      params.course,
      params.branch,
      params.category,

      params.courseId,
      params.categoryId,
      params.branchId,
      params.startDate,
      params.endDate,
      params.startTime,
      params.endTime,
      params.daysOfWeek,
      Capacity.create(params.capacity),
      params.enrolledCount,
      params.mode,
      params.durationValue,
      params.durationType,
      Price.create(params.originalPrice),
      Price.create(params.discountAmount),
      Price.create(params.discountedPrice),
      params.currency,
      params.isFree,
      Classroom.create(params.classroom),
      params.meetingLink,
      params.isFeatured,
      params.isActive,
      params.displayOrder,
      params.status,
      params.trainers,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: BatchUpdateParams) {
    if (params.name !== undefined) {
      this.name = BatchName.create(params.name);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromName(params.name);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }
    if (params.code !== undefined) this.code = BatchCode.create(params.code);
    if (params.description !== undefined) {
      this.description = params.description;
    }

    if (params.course !== undefined) {
      this.course = params.course;
    }

    if (params.branch !== undefined) {
      this.branch = params.branch;
    }

    if (params.category !== undefined) {
      this.category = params.category;
    }

    if (params.courseId !== undefined) {
      this.courseId = params.courseId;
    }

    if (params.categoryId !== undefined) {
      this.categoryId = params.categoryId;
    }

    if (params.branchId !== undefined) {
      this.branchId = params.branchId;
    }
    if (params.startDate !== undefined) this.startDate = params.startDate;
    if (params.endDate !== undefined) this.endDate = params.endDate;
    if (params.startTime !== undefined) this.startTime = params.startTime;
    if (params.endTime !== undefined) this.endTime = params.endTime;
    if (params.daysOfWeek !== undefined) this.daysOfWeek = params.daysOfWeek;
    if (params.capacity !== undefined)
      this.capacity = Capacity.create(params.capacity);
    if (params.enrolledCount !== undefined)
      this.enrolledCount = params.enrolledCount;
    if (params.mode !== undefined) this.mode = params.mode;
    if (params.durationValue !== undefined) {
      this.durationValue = params.durationValue;
    }
    if (params.durationType !== undefined) {
      this.durationType = params.durationType;
    }

    const pricingFieldsTouched =
      params.originalPrice !== undefined ||
      params.discountAmount !== undefined ||
      params.discountedPrice !== undefined ||
      params.currency !== undefined ||
      params.isFree !== undefined;

    if (pricingFieldsTouched) {
      const pricing = buildBatchPricing({
        originalPrice:
          params.originalPrice !== undefined
            ? params.originalPrice
            : this.originalPrice.getValue(),
        discountAmount:
          params.discountAmount !== undefined
            ? params.discountAmount
            : this.discountAmount.getValue(),
        discountedPrice:
          params.discountedPrice !== undefined
            ? params.discountedPrice
            : this.discountedPrice.getValue(),
        currency: params.currency ?? this.currency,
        isFree: params.isFree ?? this.isFree,
      });

      this.originalPrice = Price.create(pricing.originalPrice);
      this.discountAmount = Price.create(pricing.discountAmount);
      this.discountedPrice = Price.create(pricing.discountedPrice);
      this.currency = pricing.currency;
      this.isFree = pricing.isFree;
    }

    if (params.classroom !== undefined)
      this.classroom = Classroom.create(params.classroom);
    if (params.meetingLink !== undefined) this.meetingLink = params.meetingLink;
    if (params.isFeatured !== undefined) this.isFeatured = params.isFeatured;
    if (params.status !== undefined) this.status = params.status;
    if (params.trainers !== undefined) this.trainers = params.trainers;
    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.displayOrder = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  changeDisplayOrder(displayOrder: number | null) {
    this.displayOrder = displayOrder;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    // Archive is a separate flag — keep the date-driven lifecycle status.
    this.status = calculateBatchLifecycleStatus({
      startDate: this.startDate,
      startTime: this.startTime,
      endDate: this.endDate,
      endTime: this.endTime,
    });
    this.displayOrder = null;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    // Clear archive only; lifecycle comes from Start/End date+time.
    this.status = calculateBatchLifecycleStatus({
      startDate: this.startDate,
      startTime: this.startTime,
      endDate: this.endDate,
      endTime: this.endTime,
    });
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  getPricing(): BatchPricingSnapshot {
    return buildBatchPricing({
      originalPrice: this.originalPrice.getValue(),
      discountAmount: this.discountAmount.getValue(),
      discountedPrice: this.discountedPrice.getValue(),
      currency: this.currency,
      isFree: this.isFree,
    });
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface BatchCreateParams {
  id: string;
  name: string;
  code: string;
  slug?: string;
  description?: string | null;
  course?: {
    id: string;
    title: string;
    code?: string | null;
    category?: { id: string; name: string } | null;
  } | null;

  branch?: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;

  category?: {
    id: string;
    name: string;
  } | null;
  courseId?: string | null;
  categoryId?: string | null;
  branchId?: string | null;
  startDate: Date;
  endDate?: Date | null;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  capacity: number;
  enrolledCount?: number;
  mode?: CourseMode;
  durationValue?: number | null;
  durationType?: DurationType | null;
  originalPrice?: number;
  discountAmount?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
  classroom?: string | null;
  meetingLink?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number | null;
  status?: BatchStatus;
  trainers?: BatchTrainer[];
  createdBy?: string | null;
}

export interface BatchUpdateParams
  extends Partial<Omit<BatchCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}

export interface BatchReconstituteParams
  extends Required<
    Omit<
      BatchCreateParams,
      | 'slug'
      | 'description'
      | 'branchId'
      | 'endDate'
      | 'classroom'
      | 'meetingLink'
    >
  > {
  slug: string;
  description: string | null;

  course: {
    id: string;
    title: string;
    code?: string | null;
    category?: { id: string; name: string } | null;
  } | null;

  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;

  category: {
    id: string;
    name: string;
  } | null;

  branchId: string | null;
  categoryId: string | null;
  endDate: Date | null;
  classroom: string | null;
  meetingLink: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}
