import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StudentGender } from '../../domain/enums/student-gender.enum';
import { StudentStatus } from '../../domain/enums/student-status.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => trimOrUndefined(value))
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => trimOrUndefined(value))
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
  @Matches(/^\+?[0-9]{7,15}$/)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s-]/g, '').trim()
      : value,
  )
  phone?: string;

  @ApiPropertyOptional({ enum: StudentGender })
  @IsOptional()
  @IsEnum(StudentGender)
  gender?: StudentGender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => trimOrUndefined(value))
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => trimOrUndefined(value))
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => trimOrUndefined(value))
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => trimOrUndefined(value))
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profileImageFileId?: string;

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
  @IsDateString()
  admissionDate?: string;

  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  notes?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
