import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { StudentStatus } from '../../domain/enums/student-status.enum';

export class UpdateStudentAdmissionStatusDto {
  @ApiProperty({ enum: StudentStatus })
  @IsEnum(StudentStatus)
  status!: StudentStatus;
}
