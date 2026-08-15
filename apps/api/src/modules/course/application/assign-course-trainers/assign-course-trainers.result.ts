import { CourseTrainerResult } from '../shared/course-trainer.result';

export class AssignCourseTrainersResult {
  constructor(
    public readonly assignedCount: number,
    public readonly items: CourseTrainerResult[],
  ) {}
}
