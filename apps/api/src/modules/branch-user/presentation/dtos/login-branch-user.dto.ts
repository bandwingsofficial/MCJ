import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginBranchUserDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Email or phone is required',
  })
  identifier!: string;

  @IsString()
  @IsNotEmpty({
    message: 'Password is required',
  })
  password!: string;
}
