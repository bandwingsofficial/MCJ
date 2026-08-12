import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  branchName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  branchCode!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{10,15}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
