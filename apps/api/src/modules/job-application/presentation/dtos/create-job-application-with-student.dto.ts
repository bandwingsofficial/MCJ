import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StudentGender } from '@modules/student/domain/enums/student-gender.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateJobApplicationWithStudentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => trimString(value))
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => {
    const trimmed = trimString(value);
    return trimmed === '' ? undefined : trimmed;
  })
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @ApiProperty()
  @Matches(/^\+?[0-9]{7,15}$/)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s-]/g, '').trim()
      : value,
  )
  phone!: string;

  @ApiProperty({ enum: StudentGender })
  @IsEnum(StudentGender)
  gender!: StudentGender;

  @ApiProperty()
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => trimString(value))
  addressLine1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => trimString(value))
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => trimString(value))
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => trimString(value))
  state!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => trimString(value))
  country!: string;

  @ApiProperty()
  @Matches(/^[0-9]{6}$/)
  @Transform(({ value }) => trimString(value))
  postalCode!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @Transform(({ value }) => trimString(value))
  qualification!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => trimString(value))
  collegeName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => trimString(value))
  specialization!: string;

  @ApiProperty()
  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 10)
  @Transform(({ value }) => toNumber(value))
  passingYear!: number;
}
