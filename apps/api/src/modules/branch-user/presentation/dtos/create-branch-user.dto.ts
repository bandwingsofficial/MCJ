import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class CreateBranchUserDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\s|-/g, '')
      : value,
  )
  @Matches(/^[0-9]{10,15}$/)
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsEnum(BranchUserRole)
  role!: BranchUserRole;

  @IsOptional()
  @IsArray()
  @IsEnum(Permission, {
    each: true,
  })
  permissions?: Permission[];

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  branchId!: string;
}
