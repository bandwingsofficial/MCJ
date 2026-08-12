import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class UpdateBranchUserDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  lastName?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\s|-/g, '')
      : value,
  )
  @Matches(/^[0-9]{10,15}$/)
  phone?: string | null;

  @IsOptional()
  @IsEnum(BranchUserRole)
  role?: BranchUserRole;

  @IsOptional()
  @IsArray()
  @IsEnum(Permission, {
    each: true,
  })
  permissions?: Permission[];

  @IsOptional()
  @IsString()
  @IsUUID()
  branchId?: string;
}
