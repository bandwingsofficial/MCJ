import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_MODULE_TOKENS } from '../course-module/course-module.tokens';
import { CourseModuleModule } from '../course-module/course-module.module';
import type { CourseModuleRepository } from '../course-module/domain/repositories/course-module.repository';

import { COURSE_LESSON_TOKENS } from './course-lesson.tokens';
import { CreateCourseLessonHandler } from './application/create-course-lesson/create-course-lesson.handler';
import { PermanentDeleteCourseLessonHandler } from './application/permanent-delete-course-lesson/permanent-delete-course-lesson.handler';
import { DeleteCourseLessonHandler } from './application/delete-course-lesson/delete-course-lesson.handler';
import { GetCourseLessonHandler } from './application/get-course-lesson/get-course-lesson.handler';
import { ListCourseLessonsHandler } from './application/list-course-lessons/list-course-lessons.handler';
import { MoveCourseLessonHandler } from './application/move-course-lesson/move-course-lesson.handler';
import { RestoreCourseLessonHandler } from './application/restore-course-lesson/restore-course-lesson.handler';
import { DeactivateCourseLessonHandler } from './application/deactivate-course-lesson/deactivate-course-lesson.handler';
import { ActivateCourseLessonHandler } from './application/activate-course-lesson/activate-course-lesson.handler';
import { SetLessonPreviewHandler } from './application/set-lesson-preview/set-lesson-preview.handler';
import { UpdateCourseLessonHandler } from './application/update-course-lesson/update-course-lesson.handler';
import type { CourseLessonRepository } from './domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from './domain/services/course-lesson-domain.service';
import { PrismaCourseLessonRepository } from './infrastructure/repositories/prisma-course-lesson.repository';
import { AdminCourseLessonController } from './presentation/controllers/admin-course-lesson.controller';
import { CourseLessonController } from './presentation/controllers/course-lesson.controller';

@Module({
  imports: [PrismaModule, AuthModule, CourseModuleModule],

  controllers: [
    AdminCourseLessonController,
    CourseLessonController,
  ],

  providers: [
    CourseLessonDomainService,
    SuperAdminGuard,

    {
      provide: COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseLessonRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
        courseModuleRepo: CourseModuleRepository,
      ) =>
        new CreateCourseLessonHandler(
          courseLessonRepo,
          domainService,
          courseModuleRepo,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
      ],
    },

    {
      provide: UpdateCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new UpdateCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: ListCourseLessonsHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
      ) => new ListCourseLessonsHandler(courseLessonRepo),
      inject: [COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY],
    },

    {
      provide: GetCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new GetCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: DeleteCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new DeleteCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: PermanentDeleteCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new PermanentDeleteCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: RestoreCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new RestoreCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: DeactivateCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new DeactivateCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: ActivateCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new ActivateCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: MoveCourseLessonHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new MoveCourseLessonHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },

    {
      provide: SetLessonPreviewHandler,
      useFactory: (
        courseLessonRepo: CourseLessonRepository,
        domainService: CourseLessonDomainService,
      ) =>
        new SetLessonPreviewHandler(
          courseLessonRepo,
          domainService,
        ),
      inject: [
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
        CourseLessonDomainService,
      ],
    },
  ],

  exports: [
    COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
    CourseLessonDomainService,
  ],
})
export class CourseLessonModule {}
