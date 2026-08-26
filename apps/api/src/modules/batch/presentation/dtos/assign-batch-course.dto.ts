import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignBatchCourseDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;
}
