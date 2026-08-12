import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

export class UpdatePublicStudentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trimOrUndefined(value))
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trimOrUndefined(value))
  collegeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  specialization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 10)
  @Transform(({ value }) => toNumber(value))
  passingYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => trimOrUndefined(value))
  parentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s-]/g, '').trim()
      : value,
  )
  parentPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => trimOrUndefined(value))
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s-]/g, '').trim()
      : value,
  )
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  notes?: string;
}
