import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_LESSON_TOKENS } from '../course-lesson/course-lesson.tokens';
import { CourseLessonModule } from '../course-lesson/course-lesson.module';
import type { CourseLessonRepository } from '../course-lesson/domain/repositories/course-lesson.repository';

import { COURSE_RESOURCE_TOKENS } from './course-resource.tokens';
import { CreateCourseResourceHandler } from './application/create-course-resource/create-course-resource.handler';
import { PermanentDeleteCourseResourceHandler } from './application/permanent-delete-course-resource/permanent-delete-course-resource.handler';
import { DeleteCourseResourceHandler } from './application/delete-course-resource/delete-course-resource.handler';
import { GetCourseResourceHandler } from './application/get-course-resource/get-course-resource.handler';
import { ListCourseResourcesHandler } from './application/list-course-resources/list-course-resources.handler';
import { MoveCourseResourceHandler } from './application/move-course-resource/move-course-resource.handler';
import { RestoreCourseResourceHandler } from './application/restore-course-resource/restore-course-resource.handler';
import { UpdateCourseResourceHandler } from './application/update-course-resource/update-course-resource.handler';
import type { CourseResourceRepository } from './domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from './domain/services/course-resource-domain.service';
import { PrismaCourseResourceRepository } from './infrastructure/repositories/prisma-course-resource.repository';
import { AdminCourseResourceController } from './presentation/controllers/admin-course-resource.controller';
import { CourseResourceController } from './presentation/controllers/course-resource.controller';

@Module({
  imports: [PrismaModule, AuthModule, CourseLessonModule],

  controllers: [
    AdminCourseResourceController,
    CourseResourceController,
  ],

  providers: [
    CourseResourceDomainService,
    SuperAdminGuard,

    {
      provide: COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseResourceRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        courseLessonRepo: CourseLessonRepository,
      ) =>
        new CreateCourseResourceHandler(
          courseResourceRepo,
          courseLessonRepo,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
      ],
    },

    {
      provide: UpdateCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new UpdateCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },

    {
      provide: ListCourseResourcesHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
      ) => new ListCourseResourcesHandler(courseResourceRepo),
      inject: [COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY],
    },

    {
      provide: GetCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new GetCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },

    {
      provide: DeleteCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new DeleteCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },

    {
      provide: PermanentDeleteCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new PermanentDeleteCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },

    {
      provide: RestoreCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new RestoreCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },

    {
      provide: MoveCourseResourceHandler,
      useFactory: (
        courseResourceRepo: CourseResourceRepository,
        domainService: CourseResourceDomainService,
      ) =>
        new MoveCourseResourceHandler(
          courseResourceRepo,
          domainService,
        ),
      inject: [
        COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY,
        CourseResourceDomainService,
      ],
    },
  ],

  exports: [COURSE_RESOURCE_TOKENS.COURSE_RESOURCE_REPOSITORY],
})
export class CourseResourceModule {}
