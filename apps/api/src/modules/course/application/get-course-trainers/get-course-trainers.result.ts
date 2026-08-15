import { CourseTrainerResult } from '../shared/course-trainer.result';

export class GetCourseTrainersResult {
  constructor(public readonly items: CourseTrainerResult[]) {}

  static fromRecords(
    records: Parameters<typeof CourseTrainerResult.fromRecord>[0][],
  ): GetCourseTrainersResult {
    return new GetCourseTrainersResult(
      records.map((record) => CourseTrainerResult.fromRecord(record)),
    );
  }
}
