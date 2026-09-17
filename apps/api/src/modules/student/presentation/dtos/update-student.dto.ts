import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { CreateStudentDto } from './create-student.dto';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  studentCode?: string;

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
