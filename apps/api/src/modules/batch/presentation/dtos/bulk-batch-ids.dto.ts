import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_BATCH_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-batch-ids';

export class BulkBatchIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_BATCH_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  batchIds!: string[];
}
