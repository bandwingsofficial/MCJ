// presentation/dtos/reset-password.dto.ts

import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  @MaxLength(512)
  token!: string;

  @IsString()
  @IsNotEmpty({
    message: 'New password is required',
  })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters',
  })
  newPassword!: string;
}

export class ValidatePasswordResetTokenQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  @MaxLength(512)
  token!: string;
}
