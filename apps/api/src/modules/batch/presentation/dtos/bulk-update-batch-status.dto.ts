import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

import { BulkBatchIdsDto } from './bulk-batch-ids.dto';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class BulkUpdateBatchStatusDto extends BulkBatchIdsDto {
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isActive!: boolean;
}
