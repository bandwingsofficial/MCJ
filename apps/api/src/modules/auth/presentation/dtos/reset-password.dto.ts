// presentation/dtos/reset-password.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class ResetPasswordDto {
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

  @IsString()
  @IsNotEmpty({
    message: 'OTP is required',
  })
  @Length(6, 6, {
    message: 'OTP must be 6 digits',
  })
  @Matches(/^\d+$/, {
    message: 'OTP must contain only numbers',
  })
  otp!: string;

  @IsString()
  @IsNotEmpty({
    message: 'New password is required',
  })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters',
  })
  newPassword!: string;
}
