import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class SendPasswordResetOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;
}

export class VerifyPasswordResetOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  otp!: string;
}

export class CompletePasswordResetOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Reset authorization is required' })
  @MaxLength(512)
  resetToken!: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword!: string;
}
