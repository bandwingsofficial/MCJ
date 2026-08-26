import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCoursesToBranchDto {
  @ApiProperty({
    type: [String],
    example: ['uuid-course-1', 'uuid-course-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.filter(Boolean))]
      : value,
  )
  courseIds!: string[];
}
