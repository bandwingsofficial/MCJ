import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_CATEGORY_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-category-ids';
import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class BulkUpdateCategoryStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_CATEGORY_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  categoryIds!: string[];

  @IsEnum(CategoryStatus)
  status!: CategoryStatus;
}
