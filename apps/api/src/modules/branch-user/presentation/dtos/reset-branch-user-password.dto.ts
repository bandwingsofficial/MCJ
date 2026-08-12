import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class ResetBranchUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  newPassword!: string;
}
