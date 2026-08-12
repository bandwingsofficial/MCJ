import { IsEnum, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

import { Transform } from 'class-transformer';

import { ClientType } from '../../domain/enums/client-type.enum';

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

  @IsOptional()
  @IsEnum(ClientType, {
    message: 'clientType must be WEB, IOS, ANDROID, ADMIN_WEB, or UNKNOWN',
  })
  clientType?: ClientType;
}
