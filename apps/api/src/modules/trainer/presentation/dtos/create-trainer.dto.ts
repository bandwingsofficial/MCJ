import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TrainerGender } from '../../domain/enums/trainer-gender.enum';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const toStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return undefined;
};

export class CreateTrainerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s-]/g, '').trim()
      : value,
  )
  phone?: string;

  @ApiPropertyOptional({ enum: TrainerGender })
  @IsOptional()
  @IsEnum(TrainerGender)
  gender?: TrainerGender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  @Transform(({ value }) => toNumber(value))
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated or JSON string array',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profileImageFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  employeeCode?: string;

  @ApiPropertyOptional({ enum: TrainerType })
  @IsOptional()
  @IsEnum(TrainerType)
  trainerType?: TrainerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedInUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Transform(({ value }) => toNumber(value))
  averageRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  totalReviews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiPropertyOptional({ enum: TrainerStatus })
  @IsOptional()
  @IsEnum(TrainerStatus)
  status?: TrainerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated or JSON string array of course UUIDs',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  @Transform(({ value }) => toStringArray(value))
  courseIds?: string[];
}
