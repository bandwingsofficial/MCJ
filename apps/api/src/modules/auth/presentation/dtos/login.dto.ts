// presentation/dtos/login.dto.ts

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ClientType } from '../../domain/enums/client-type.enum';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Email or phone is required' })
  identifier!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  /** Explicit client platform for session listing (web / iOS / Android). */
  @IsOptional()
  @IsEnum(ClientType, {
    message: 'clientType must be WEB, IOS, ANDROID, ADMIN_WEB, or UNKNOWN',
  })
  clientType?: ClientType;
}
