import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCourseFaqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  answer!: string;
}
