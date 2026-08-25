import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_TOKENS } from '../course/course.tokens';
import { CourseModule } from '../course/course.module';
import type { CourseRepository } from '../course/domain/repositories/course.repository';

import { COURSE_MODULE_TOKENS } from './course-module.tokens';
import { CreateCourseModuleHandler } from './application/create-course-module/create-course-module.handler';
import { DeactivateCourseModuleHandler } from './application/deactivate-course-module/deactivate-course-module.handler';
import { DeleteCourseModuleHandler } from './application/delete-course-module/delete-course-module.handler';
import { GetCourseModuleHandler } from './application/get-course-module/get-course-module.handler';
import { ListCourseModulesHandler } from './application/list-course-modules/list-course-modules.handler';
import { MoveCourseModuleHandler } from './application/move-course-module/move-course-module.handler';
import { RestoreCourseModuleHandler } from './application/restore-course-module/restore-course-module.handler';
import { UpdateCourseModuleHandler } from './application/update-course-module/update-course-module.handler';
import type { CourseModuleRepository } from './domain/repositories/course-module.repository';
import { CourseModuleDomainService } from './domain/services/course-module-domain.service';
import { PrismaCourseModuleRepository } from './infrastructure/repositories/prisma-course-module.repository';
import { AdminCourseModuleController } from './presentation/controllers/admin-course-module.controller';
import { CourseModuleController } from './presentation/controllers/course-module.controller';

@Module({
  imports: [PrismaModule, AuthModule, CourseModule],

  controllers: [
    AdminCourseModuleController,
    CourseModuleController,
  ],

  providers: [
    CourseModuleDomainService,
    SuperAdminGuard,

    {
      provide: COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseModuleRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
        courseRepo: CourseRepository,
      ) =>
        new CreateCourseModuleHandler(
          courseModuleRepo,
          domainService,
          courseRepo,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
        COURSE_TOKENS.COURSE_REPOSITORY,
      ],
    },

    {
      provide: UpdateCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new UpdateCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },

    {
      provide: ListCourseModulesHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
      ) => new ListCourseModulesHandler(courseModuleRepo),
      inject: [COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY],
    },

    {
      provide: GetCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new GetCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },

    {
      provide: DeleteCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new DeleteCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },

    {
      provide: DeactivateCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new DeactivateCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },

    {
      provide: RestoreCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new RestoreCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },

    {
      provide: MoveCourseModuleHandler,
      useFactory: (
        courseModuleRepo: CourseModuleRepository,
        domainService: CourseModuleDomainService,
      ) =>
        new MoveCourseModuleHandler(
          courseModuleRepo,
          domainService,
        ),
      inject: [
        COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY,
        CourseModuleDomainService,
      ],
    },
  ],

  exports: [COURSE_MODULE_TOKENS.COURSE_MODULE_REPOSITORY],
})
export class CourseModuleModule {}
