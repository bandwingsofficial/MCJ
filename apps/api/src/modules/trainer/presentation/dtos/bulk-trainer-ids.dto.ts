import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

import { BULK_TRAINER_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-trainer-ids';

export class BulkTrainerIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_TRAINER_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  trainerIds!: string[];
}
