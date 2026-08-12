import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const toStringArray = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

export class AssignBatchTrainersDto {
  @ApiPropertyOptional({
    description: 'Comma-separated or JSON string array. Empty array removes all trainers.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => toStringArray(value))
  trainerIds: string[] = [];
}
