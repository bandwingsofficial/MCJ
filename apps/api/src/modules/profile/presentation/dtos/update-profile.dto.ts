// src/modules/profile/presentation/dtos/update-profile.dto.ts

import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

import { Gender } from '../../domain/enums/gender.enum';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/)
  phone?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @IsOptional()
  @IsDateString()
  dob?: Date | null;

  @IsOptional()
  @IsUrl()
  profileImage?: string | null;

  // 📍 address

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

  // 🧠 extras

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string | null;
}