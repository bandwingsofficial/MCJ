import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshBranchUserTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
