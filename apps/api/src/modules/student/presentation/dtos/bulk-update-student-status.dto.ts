import { IsBoolean } from 'class-validator';

import { BulkStudentIdsDto } from './bulk-student-ids.dto';

export class BulkUpdateStudentStatusDto extends BulkStudentIdsDto {
  @IsBoolean()
  isActive!: boolean;
}
