import type { CourseTrainerRecord } from '../../domain/repositories/course.repository';

export class CourseTrainerResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly employeeCode: string | null,
    public readonly specialization: string | null,
    public readonly phone: string | null,
    public readonly status: string,
  ) {}

  static fromRecord(record: CourseTrainerRecord): CourseTrainerResult {
    return new CourseTrainerResult(
      record.id,
      record.firstName,
      record.lastName,
      record.employeeCode,
      record.specialization,
      record.phone,
      record.status,
    );
  }
}
