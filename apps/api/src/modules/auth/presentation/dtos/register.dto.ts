// presentation/dtos/register.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Name is required',
  })
  @MinLength(2, {
    message: 'Name must be at least 2 characters',
  })
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail(
    {},
    {
      message: 'Invalid email format',
    },
  )
  email!: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  password!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '') {
      return undefined;
    }

    return typeof value === 'string' ? value.trim() : value;
  })
  @Matches(/^(\+91)?[6-9]\d{9}$/, {
    message: 'Invalid phone number format',
  })
  phone?: string;
}
