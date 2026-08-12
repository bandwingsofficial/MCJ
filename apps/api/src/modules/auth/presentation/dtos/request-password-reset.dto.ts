// presentation/dtos/request-password-reset.dto.ts

import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail(
    {},
    {
      message: 'Invalid email format',
    },
  )
  @IsNotEmpty({
    message: 'Email is required',
  })
  @MaxLength(255)
  email!: string;
}
