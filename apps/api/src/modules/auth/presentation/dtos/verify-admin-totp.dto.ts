// presentation/dtos/verify-admin-totp.dto.ts

import { IsNotEmpty, Length, Matches } from 'class-validator';

import { Transform } from 'class-transformer';

export class VerifyAdminTotpDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'MFA token is required',
  })
  mfaToken!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty({
    message: 'TOTP code is required',
  })
  @Length(6, 6, {
    message: 'TOTP code must be 6 digits',
  })
  @Matches(/^\d{6}$/, {
    message: 'TOTP code must contain only numbers',
  })
  totpCode!: string;
}
