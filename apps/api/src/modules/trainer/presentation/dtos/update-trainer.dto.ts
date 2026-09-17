import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { CreateTrainerDto } from './create-trainer.dto';

export class UpdateTrainerDto extends PartialType(
  OmitType(CreateTrainerDto, ['courseIds', 'profileImageFileId'] as const),
) {
  @ApiPropertyOptional({
    description:
      'Upload file ID from POST /admin/uploads, or null to remove image',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  profileImageFileId?: string | null;
}
