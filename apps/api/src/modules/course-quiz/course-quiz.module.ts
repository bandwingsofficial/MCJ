import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_LESSON_TOKENS } from '../course-lesson/course-lesson.tokens';
import { CourseLessonModule } from '../course-lesson/course-lesson.module';
import type { CourseLessonRepository } from '../course-lesson/domain/repositories/course-lesson.repository';

import { COURSE_QUIZ_TOKENS } from './course-quiz.tokens';
import { CreateQuizHandler } from './application/create-quiz/create-quiz.handler';
import { CreateQuestionHandler } from './application/create-question/create-question.handler';
import { DeleteQuizHandler } from './application/delete-quiz/delete-quiz.handler';
import { DeleteQuestionHandler } from './application/delete-question/delete-question.handler';
import { GetQuizHandler } from './application/get-quiz/get-quiz.handler';
import { ListCourseQuizzesHandler } from './application/list-course-quizzes/list-course-quizzes.handler';
import { ListQuestionsHandler } from './application/list-questions/list-questions.handler';
import { PublishQuizHandler } from './application/publish-quiz/publish-quiz.handler';
import { ReorderQuestionsHandler } from './application/reorder-questions/reorder-questions.handler';
import { RestoreQuizHandler } from './application/restore-quiz/restore-quiz.handler';
import { UpdateQuizHandler } from './application/update-quiz/update-quiz.handler';
import { UpdateQuestionHandler } from './application/update-question/update-question.handler';
import type { CourseQuizRepository } from './domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from './domain/services/course-quiz-domain.service';
import { PrismaCourseQuizRepository } from './infrastructure/repositories/prisma-course-quiz.repository';
import { AdminCourseQuizController } from './presentation/controllers/admin-course-quiz.controller';
import { AdminCourseQuizQuestionController } from './presentation/controllers/admin-course-quiz-question.controller';

@Module({
  imports: [PrismaModule, AuthModule, CourseLessonModule],

  controllers: [
    AdminCourseQuizController,
    AdminCourseQuizQuestionController,
  ],

  providers: [
    CourseQuizDomainService,
    SuperAdminGuard,

    {
      provide: COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseQuizRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        courseLessonRepo: CourseLessonRepository,
      ) =>
        new CreateQuizHandler(courseQuizRepo, courseLessonRepo),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
      ],
    },

    {
      provide: ListCourseQuizzesHandler,
      useFactory: (courseQuizRepo: CourseQuizRepository) =>
        new ListCourseQuizzesHandler(courseQuizRepo),
      inject: [COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY],
    },

    {
      provide: GetQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new GetQuizHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: UpdateQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new UpdateQuizHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: DeleteQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new DeleteQuizHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: RestoreQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new RestoreQuizHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: PublishQuizHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new PublishQuizHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: ListQuestionsHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new ListQuestionsHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: CreateQuestionHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new CreateQuestionHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: UpdateQuestionHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new UpdateQuestionHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: DeleteQuestionHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new DeleteQuestionHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },

    {
      provide: ReorderQuestionsHandler,
      useFactory: (
        courseQuizRepo: CourseQuizRepository,
        domainService: CourseQuizDomainService,
      ) => new ReorderQuestionsHandler(courseQuizRepo, domainService),
      inject: [
        COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY,
        CourseQuizDomainService,
      ],
    },
  ],

  exports: [COURSE_QUIZ_TOKENS.COURSE_QUIZ_REPOSITORY],
})
export class CourseQuizModule {}
