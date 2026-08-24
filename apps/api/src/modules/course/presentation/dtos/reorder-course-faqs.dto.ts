import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class ReorderCourseFaqsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  orderedIds!: string[];
}
