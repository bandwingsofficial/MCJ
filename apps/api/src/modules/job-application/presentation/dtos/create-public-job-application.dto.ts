import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const trim = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

const toOptionalInt = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

export class CreatePublicJobApplicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Transform(({ value }) => trim(value))
  applicantName!: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  applicantEmail!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @Transform(({ value }) => trim(value))
  applicantPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trim(value))
  currentLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trim(value))
  highestQualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toOptionalInt(value))
  yearsOfExperience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trim(value))
  coverLetter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => trim(value))
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toOptionalInt(value))
  expectedSalary?: number;
}
