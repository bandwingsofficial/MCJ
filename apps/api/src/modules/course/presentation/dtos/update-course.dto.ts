import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['thumbnailFileId'] as const),
) {
  @ApiPropertyOptional({
    description:
      'Upload file ID from POST /admin/uploads, or null to remove image',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  thumbnailFileId?: string | null;
}
