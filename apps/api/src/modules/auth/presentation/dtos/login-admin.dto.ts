// presentation/dtos/login-admin.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { Transform } from 'class-transformer';

export class LoginAdminDto {
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
}
