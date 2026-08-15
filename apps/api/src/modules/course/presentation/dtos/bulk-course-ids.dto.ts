import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_COURSE_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-course-ids';

export class BulkCourseIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_COURSE_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  courseIds!: string[];
}
