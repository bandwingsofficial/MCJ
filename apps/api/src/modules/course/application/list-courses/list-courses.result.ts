import { GetCourseResult } from '../get-course/get-course.result';

export class ListCoursesResult {
  constructor(
    public readonly items: GetCourseResult[],
    public readonly total: number,
  ) {}
}
