import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTrainerCoursesDto {
  @ApiProperty({
    type: [String],
    description: 'Course IDs to assign to trainer',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  courseIds!: string[];
}
