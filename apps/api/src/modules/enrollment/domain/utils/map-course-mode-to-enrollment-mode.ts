import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';

import { EnrollmentMode } from '../enums/enrollment-mode.enum';

export function mapCourseModeToEnrollmentMode(
  mode: CourseMode | string | null | undefined,
): EnrollmentMode {
  switch (mode) {
    case CourseMode.ONLINE:
    case 'ONLINE':
      return EnrollmentMode.ONLINE;
    case CourseMode.RECORDED:
    case 'RECORDED':
      return EnrollmentMode.SELF_PACED;
    case CourseMode.OFFLINE:
    case 'OFFLINE':
    default:
      return EnrollmentMode.OFFLINE;
  }
}
