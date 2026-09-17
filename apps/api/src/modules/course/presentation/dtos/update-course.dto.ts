import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
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
