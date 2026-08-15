import { Transform } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class ReorderCoursesDto {
  @IsUUID()
  courseId!: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  newDisplayOrder!: number;
}
