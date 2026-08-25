import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StudentDocumentType } from '../../domain/enums/student-document-type.enum';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class CreateStudentDocumentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  name!: string;

  @ApiProperty({ enum: StudentDocumentType })
  @IsEnum(StudentDocumentType)
  type!: StudentDocumentType;

  @ApiProperty()
  @IsUUID()
  fileId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => trimOrUndefined(value))
  description?: string;
}
