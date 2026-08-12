import { Course } from '@modules/course/domain/entities/course.entity';

export class TrainerCourse {
  constructor(
    public readonly id: string,
    public readonly trainerId: string,
    public readonly courseId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly course?: Course,
  ) {}

  static create(params: {
    id: string;
    trainerId: string;
    courseId: string;
    course?: Course;
  }): TrainerCourse {
    return new TrainerCourse(
      params.id,
      params.trainerId,
      params.courseId,
      new Date(),
      new Date(),
      params.course,
    );
  }
}