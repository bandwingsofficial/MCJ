import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateTrainerDto } from './create-trainer.dto';

export class UpdateTrainerDto extends PartialType(
  OmitType(CreateTrainerDto, ['courseIds'] as const),
) {}
