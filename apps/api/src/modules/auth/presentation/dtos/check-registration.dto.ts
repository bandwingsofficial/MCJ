import { IsEmail, IsString, Matches } from 'class-validator';

export class CheckRegistrationEmailQueryDto {
  @IsEmail()
  email!: string;
}

export class CheckRegistrationPhoneQueryDto {
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone!: string;
}
