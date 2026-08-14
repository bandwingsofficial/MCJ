import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_CATEGORY_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-category-ids';

export class BulkCategoryIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_CATEGORY_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  categoryIds!: string[];
}
