import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateBatchDto } from './create-batch.dto';

export class UpdateBatchDto extends PartialType(
  OmitType(CreateBatchDto, ['trainerIds'] as const),
) {}