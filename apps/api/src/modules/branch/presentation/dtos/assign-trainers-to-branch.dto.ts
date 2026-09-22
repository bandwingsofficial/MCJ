import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssignBranchTrainerTypeDto {
  BRANCH_ONLY = 'BRANCH_ONLY',
  COURSE_BATCH = 'COURSE_BATCH',
}

export class AssignTrainersToBranchDto {
  @ApiProperty({
    enum: AssignBranchTrainerTypeDto,
    default: AssignBranchTrainerTypeDto.BRANCH_ONLY,
  })
  @IsOptional()
  @IsEnum(AssignBranchTrainerTypeDto)
  assignmentType?: AssignBranchTrainerTypeDto;

  @ApiProperty({
    type: [String],
    example: ['uuid-trainer-1', 'uuid-trainer-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.filter(Boolean))]
      : value,
  )
  trainerIds!: string[];

  @ApiPropertyOptional()
  @ValidateIf(
    (dto: AssignTrainersToBranchDto) =>
      dto.assignmentType === AssignBranchTrainerTypeDto.COURSE_BATCH,
  )
  @IsUUID('4')
  courseId?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (dto: AssignTrainersToBranchDto) =>
      dto.assignmentType === AssignBranchTrainerTypeDto.COURSE_BATCH,
  )
  @IsUUID('4')
  batchId?: string;

  @ApiPropertyOptional({ example: 'OFFLINE' })
  @ValidateIf(
    (dto: AssignTrainersToBranchDto) =>
      dto.assignmentType === AssignBranchTrainerTypeDto.COURSE_BATCH,
  )
  @IsOptional()
  mode?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (dto: AssignTrainersToBranchDto) =>
      dto.assignmentType === AssignBranchTrainerTypeDto.COURSE_BATCH,
  )
  @IsUUID('4')
  batchTimingId?: string;
}
