import { Slug } from '@common/value-objects/slug.vo';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchStatus } from '../enums/batch-status.enum';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { BatchCode } from '../value-objects/batch-code.vo';
import { BatchName } from '../value-objects/batch-name.vo';
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
} | null,

public branch: {
  id: string;
  branchName: string;
  branchCode: string;
} | null,
    public courseId: string,
    public branchId: string | null,
    public startDate: Date,
    public endDate: Date | null,
    public startTime: string,
    public endTime: string,
    public daysOfWeek: DayOfWeek[],
    public capacity: Capacity,
    public enrolledCount: number,
    public mode: CourseMode,
    public classroom: Classroom,
    public meetingLink: string | null,
    public isFeatured: boolean,
    public isActive: boolean,
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

    params.courseId,
    params.branchId ?? null,
    params.startDate,
    params.endDate ?? null,
    params.startTime,
    params.endTime,
    params.daysOfWeek,
    Capacity.create(params.capacity),
    params.enrolledCount ?? 0,
    params.mode ?? CourseMode.OFFLINE,
    Classroom.create(params.classroom),
    params.meetingLink ?? null,
    params.isFeatured ?? false,
    params.isActive ?? true,
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
  static reconstitute(
  params: BatchReconstituteParams,
): Batch {
  return new Batch(
    params.id,
    BatchName.create(params.name),
    BatchCode.create(params.code),
    Slug.create(params.slug),
    params.description,

    params.course,
    params.branch,

    params.courseId,
    params.branchId,
    params.startDate,
    params.endDate,
    params.startTime,
    params.endTime,
    params.daysOfWeek,
    Capacity.create(params.capacity),
    params.enrolledCount,
    params.mode,
    Classroom.create(params.classroom),
    params.meetingLink,
    params.isFeatured,
    params.isActive,
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

if (params.courseId !== undefined) {
  this.courseId = params.courseId;
}

if (params.branchId !== undefined) {
  this.branchId = params.branchId;
}
    if (params.startDate !== undefined) this.startDate = params.startDate;
    if (params.endDate !== undefined) this.endDate = params.endDate;
    if (params.startTime !== undefined) this.startTime = params.startTime;
    if (params.endTime !== undefined) this.endTime = params.endTime;
    if (params.daysOfWeek !== undefined) this.daysOfWeek = params.daysOfWeek;
    if (params.capacity !== undefined) this.capacity = Capacity.create(params.capacity);
    if (params.enrolledCount !== undefined) this.enrolledCount = params.enrolledCount;
    if (params.mode !== undefined) this.mode = params.mode;
    if (params.classroom !== undefined) this.classroom = Classroom.create(params.classroom);
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
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.status = BatchStatus.ARCHIVED;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = BatchStatus.UPCOMING;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
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
} | null;

branch?: {
  id: string;
  branchName: string;
  branchCode: string;
} | null;
  courseId: string;
  branchId?: string | null;
  startDate: Date;
  endDate?: Date | null;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  capacity: number;
  enrolledCount?: number;
  mode?: CourseMode;
  classroom?: string | null;
  meetingLink?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
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
  } | null;

  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;

  branchId: string | null;
  endDate: Date | null;
  classroom: string | null;
  meetingLink: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}