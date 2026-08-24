import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetLessonPreviewDto {
  @ApiProperty({
    example: true,
    description:
      'When true, the lesson is unlocked for public/free preview. When false, it is locked.',
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  })
  isPreview!: boolean;
}
