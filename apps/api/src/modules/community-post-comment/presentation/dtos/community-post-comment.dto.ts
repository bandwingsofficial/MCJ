import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityPostCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2200)
  content!: string;
}

export class ReplyCommunityPostCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2200)
  content!: string;
}

export class UpdateCommunityPostCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2200)
  content!: string;
}
