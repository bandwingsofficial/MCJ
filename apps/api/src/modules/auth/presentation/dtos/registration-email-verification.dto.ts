import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class SendRegistrationEmailOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;
}

export class VerifyRegistrationEmailOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  otp!: string;
}
