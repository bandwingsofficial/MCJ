import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UnenrollEnrollmentDto {
  @ApiPropertyOptional({
    example: 'Student requested withdrawal',
    description: 'Optional reason stored in enrollment remarks.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
