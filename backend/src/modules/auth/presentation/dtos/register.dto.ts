// presentation/dtos/register.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name!: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value?.trim()))
  @Matches(/^(\+91)?[6-9]\d{9}$/, {
    message: 'Invalid phone number format',
  })
  phone?: string;
}