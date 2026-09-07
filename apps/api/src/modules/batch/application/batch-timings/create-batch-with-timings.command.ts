import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';

export type BatchModeConfigInput = {
  mode: CourseMode;
  templateIds: string[];
  originalPrice?: number;
  discountAmount?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
};

export class CreateBatchWithTimingsCommand {
  constructor(
    public readonly courseId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    /** Batch timing masters (templates) to copy into this batch as children. */
    public readonly templateIds: string[],
    public readonly durationValue: number,
    public readonly durationType: string,
    public readonly name?: string,
    public readonly capacity?: number,
    public readonly createdBy?: string,
    public readonly originalPrice?: number,
    public readonly discountAmount?: number,
    public readonly discountedPrice?: number,
    public readonly currency?: string,
    public readonly isFree?: boolean,
    public readonly modeConfigs?: BatchModeConfigInput[],
  ) {}
}
