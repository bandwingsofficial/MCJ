import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

export class CreateJobApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  resumeFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  coverLetter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  currentLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  expectedSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  remarks?: string;
}
