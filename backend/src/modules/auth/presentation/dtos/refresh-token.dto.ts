// presentation/dtos/refresh-token.dto.ts

import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken!: string;
}