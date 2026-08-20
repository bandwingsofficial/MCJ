import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_STUDENT_MAX_SIZE } from '../../application/shared/parse-bulk-student-ids';

export class BulkStudentIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_STUDENT_MAX_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  studentIds!: string[];
}
