import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_COURSE_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-course-ids';
import { CourseStatus } from '../../domain/enums/course-status.enum';

export class BulkUpdateCourseStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_COURSE_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  courseIds!: string[];

  @IsEnum(CourseStatus)
  status!: CourseStatus;
}
