import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  branchCode?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @Matches(/^[0-9]{10,15}$/)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @IsOptional()
  @IsLatitude()
  latitude?: number | null;

  @IsOptional()
  @IsLongitude()
  longitude?: number | null;

  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
