import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';

import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { BULK_TRAINER_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-trainer-ids';

export class BulkUpdateTrainerStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_TRAINER_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  trainerIds!: string[];

  @IsEnum(TrainerStatus)
  status!: TrainerStatus;
}
