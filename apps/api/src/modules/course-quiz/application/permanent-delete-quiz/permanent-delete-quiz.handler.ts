import type { CourseLessonRepository } from '@modules/course-lesson/domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '@modules/course-lesson/domain/services/course-lesson-domain.service';

import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';

import { PermanentDeleteQuizCommand } from './permanent-delete-quiz.command';
import { PermanentDeleteQuizResult } from './permanent-delete-quiz.result';

export class PermanentDeleteQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly quizDomainService: CourseQuizDomainService,
    private readonly lessonDomainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: PermanentDeleteQuizCommand,
  ): Promise<PermanentDeleteQuizResult> {
    const quiz = await this.quizDomainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.id, true),
    );

    const lesson = await this.lessonDomainService.ensureExists(
      await this.courseLessonRepo.findById(quiz.lessonId, true),
    );

    const { moduleId, displayOrder } = lesson;

    await this.courseLessonRepo.deletePermanent(lesson.id);

    await this.courseLessonRepo.closeDisplayOrderGap(
      moduleId,
      displayOrder,
    );

    return new PermanentDeleteQuizResult(quiz.id, true);
  }
}
