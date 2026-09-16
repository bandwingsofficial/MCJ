import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_LESSON_TOKENS } from '../course-lesson/course-lesson.tokens';
import { CourseLessonModule } from '../course-lesson/course-lesson.module';
import type { CourseLessonRepository } from '../course-lesson/domain/repositories/course-lesson.repository';

import { COURSE_LEARN_ITEM_TOKENS } from './course-learn-item.tokens';
import { CreateCourseLearnItemHandler } from './application/create-course-learn-item/create-course-learn-item.handler';
import { DeleteCourseLearnItemHandler } from './application/delete-course-learn-item/delete-course-learn-item.handler';
import { GetCourseLearnItemHandler } from './application/get-course-learn-item/get-course-learn-item.handler';
import { ListCourseLearnItemsHandler } from './application/list-course-learn-items/list-course-learn-items.handler';
import { MoveCourseLearnItemHandler } from './application/move-course-learn-item/move-course-learn-item.handler';
import { UpdateCourseLearnItemHandler } from './application/update-course-learn-item/update-course-learn-item.handler';
import type { CourseLearnItemRepository } from './domain/repositories/course-learn-item.repository';
import { CourseLearnItemDomainService } from './domain/services/course-learn-item-domain.service';
import { PrismaCourseLearnItemRepository } from './infrastructure/repositories/prisma-course-learn-item.repository';
import { AdminCourseLearnItemController } from './presentation/controllers/admin-course-learn-item.controller';

@Module({
  imports: [PrismaModule, AuthModule, CourseLessonModule],

  controllers: [AdminCourseLearnItemController],

  providers: [
    CourseLearnItemDomainService,
    SuperAdminGuard,

    {
      provide: COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseLearnItemRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCourseLearnItemHandler,
      useFactory: (
        courseLearnItemRepo: CourseLearnItemRepository,
        courseLessonRepo: CourseLessonRepository,
      ) =>
        new CreateCourseLearnItemHandler(
          courseLearnItemRepo,
          courseLessonRepo,
        ),
      inject: [
        COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
        COURSE_LESSON_TOKENS.COURSE_LESSON_REPOSITORY,
      ],
    },

    {
      provide: UpdateCourseLearnItemHandler,
      useFactory: (
        courseLearnItemRepo: CourseLearnItemRepository,
        domainService: CourseLearnItemDomainService,
      ) =>
        new UpdateCourseLearnItemHandler(
          courseLearnItemRepo,
          domainService,
        ),
      inject: [
        COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
        CourseLearnItemDomainService,
      ],
    },

    {
      provide: ListCourseLearnItemsHandler,
      useFactory: (courseLearnItemRepo: CourseLearnItemRepository) =>
        new ListCourseLearnItemsHandler(courseLearnItemRepo),
      inject: [COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY],
    },

    {
      provide: GetCourseLearnItemHandler,
      useFactory: (
        courseLearnItemRepo: CourseLearnItemRepository,
        domainService: CourseLearnItemDomainService,
      ) =>
        new GetCourseLearnItemHandler(
          courseLearnItemRepo,
          domainService,
        ),
      inject: [
        COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
        CourseLearnItemDomainService,
      ],
    },

    {
      provide: DeleteCourseLearnItemHandler,
      useFactory: (
        courseLearnItemRepo: CourseLearnItemRepository,
        domainService: CourseLearnItemDomainService,
      ) =>
        new DeleteCourseLearnItemHandler(
          courseLearnItemRepo,
          domainService,
        ),
      inject: [
        COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
        CourseLearnItemDomainService,
      ],
    },

    {
      provide: MoveCourseLearnItemHandler,
      useFactory: (
        courseLearnItemRepo: CourseLearnItemRepository,
        domainService: CourseLearnItemDomainService,
      ) =>
        new MoveCourseLearnItemHandler(
          courseLearnItemRepo,
          domainService,
        ),
      inject: [
        COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY,
        CourseLearnItemDomainService,
      ],
    },
  ],

  exports: [COURSE_LEARN_ITEM_TOKENS.COURSE_LEARN_ITEM_REPOSITORY],
})
export class CourseLearnItemModule {}
