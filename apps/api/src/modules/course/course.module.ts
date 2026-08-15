import { Module ,forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { CATEGORY_TOKENS } from '../category/category.tokens';
import { CategoryModule } from '../category/category.module';
import type { CategoryRepository } from '../category/domain/repositories/category.repository';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';

import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ENROLLMENT_TOKENS } from '../enrollment/enrollment.tokens';
import type { EnrollmentRepository } from '../enrollment/domain/repositories/enrollment.repository';
import { StudentModule } from '../student/student.module';
import { STUDENT_TOKENS } from '../student/student.tokens';
import type { StudentRepository } from '../student/domain/repositories/student.repository';

import { COURSE_TOKENS } from './course.tokens';
import { BulkDeleteCoursesHandler } from './application/bulk-delete-courses/bulk-delete-courses.handler';
import { BulkPermanentDeleteCoursesHandler } from './application/bulk-permanent-delete-courses/bulk-permanent-delete-courses.handler';
import { BulkRestoreCoursesHandler } from './application/bulk-restore-courses/bulk-restore-courses.handler';
import { BulkUpdateCourseStatusHandler } from './application/bulk-update-course-status/bulk-update-course-status.handler';
import { CreateCourseHandler } from './application/create-course/create-course.handler';
import { DeleteCourseHandler } from './application/delete-course/delete-course.handler';
import { GetCourseBySlugHandler } from './application/get-course-by-slug/get-course-by-slug.handler';
import { GetCourseSummaryHandler } from './application/get-course-summary/get-course-summary.handler';
import { GetPublicCourseModulesHandler } from './application/get-public-course-modules/get-public-course-modules.handler';
import { GetPreviewLessonHandler } from './application/get-preview-lesson/get-preview-lesson.handler';
import { GetCourseHandler } from './application/get-course/get-course.handler';
import { ListCoursesHandler } from './application/list-courses/list-courses.handler';
import { PermanentDeleteCourseHandler } from './application/permanent-delete-course/permanent-delete-course.handler';
import { ReorderCoursesHandler } from './application/reorder-courses/reorder-courses.handler';
import { RestoreCourseHandler } from './application/restore-course/restore-course.handler';
import { SuggestCourseCodeHandler } from './application/suggest-course-code/suggest-course-code.handler';
import { GetCourseTrainersHandler } from './application/get-course-trainers/get-course-trainers.handler';
import { GetAvailableCourseTrainersHandler } from './application/get-available-course-trainers/get-available-course-trainers.handler';
import { AssignCourseTrainersHandler } from './application/assign-course-trainers/assign-course-trainers.handler';
import { RemoveCourseTrainerHandler } from './application/remove-course-trainer/remove-course-trainer.handler';
import { UpdateCourseHandler } from './application/update-course/update-course.handler';
import { UpdateCourseStatusHandler } from './application/update-course-status/update-course-status.handler';
import type { CourseRepository } from './domain/repositories/course.repository';
import { CourseDomainService } from './domain/services/course-domain.service';
import { CourseHierarchyService } from './infrastructure/services/course-hierarchy.service';
import { PrismaCourseRepository } from './infrastructure/repositories/prisma-course.repository';
import { AdminCourseController } from './presentation/controllers/admin-course.controller';
import { CourseController } from './presentation/controllers/course.controller';
import { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CategoryModule,
    UploadsModule,
    BranchModule,
    StudentModule,
    forwardRef(() => EnrollmentModule),
  ],

  controllers: [
    AdminCourseController,
    CourseController,
  ],

  providers: [
    CourseDomainService,
    CourseHierarchyService,
    SuperAdminGuard,

    {
      provide: COURSE_TOKENS.COURSE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCourseRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        categoryRepo: CategoryRepository,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateCourseHandler(
          courseRepo,
          categoryRepo,
          domainService,
          branchRepo,
          uploadDomainService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        UploadDomainService,
      ],
    },

    {
      provide: UpdateCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        categoryRepo: CategoryRepository,
        uploadDomainService: UploadDomainService,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
      ) =>
        new UpdateCourseHandler(
          courseRepo,
          categoryRepo,
          uploadDomainService,
          domainService,
          branchRepo,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        UploadDomainService,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },

    {
      provide: ListCoursesHandler,
      useFactory: (
        courseRepo: CourseRepository,
        branchRepo: BranchRepository,
        categoryRepo: CategoryRepository,
      ) =>
        new ListCoursesHandler(
          courseRepo,
          branchRepo,
          categoryRepo,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
      ],
    },

    {
      provide: GetCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
        categoryRepo: CategoryRepository,
        hierarchyService: CourseHierarchyService,
        studentRepo: StudentRepository,
        enrollmentRepo: EnrollmentRepository,
      ) =>
        new GetCourseHandler(
          courseRepo,
          domainService,
          branchRepo,
          categoryRepo,
          hierarchyService,
          studentRepo,
          enrollmentRepo,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CourseHierarchyService,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
      ],
    },

    {
      provide: GetCourseBySlugHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
        categoryRepo: CategoryRepository,
        hierarchyService: CourseHierarchyService,
        studentRepo: StudentRepository,
        enrollmentRepo: EnrollmentRepository,
      ) =>
        new GetCourseBySlugHandler(
          courseRepo,
          domainService,
          branchRepo,
          categoryRepo,
          hierarchyService,
          studentRepo,
          enrollmentRepo,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CourseHierarchyService,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
      ],
    },

    {
      provide: GetPublicCourseModulesHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        hierarchyService: CourseHierarchyService,
      ) =>
        new GetPublicCourseModulesHandler(
          courseRepo,
          domainService,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        CourseHierarchyService,
      ],
    },

    {
      provide: GetPreviewLessonHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        hierarchyService: CourseHierarchyService,
      ) =>
        new GetPreviewLessonHandler(
          courseRepo,
          domainService,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        CourseHierarchyService,
      ],
    },

    {
      provide: DeleteCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        hierarchyService: CourseHierarchyService,
      ) =>
        new DeleteCourseHandler(
          courseRepo,
          domainService,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        CourseHierarchyService,
      ],
    },

    {
      provide: RestoreCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
        hierarchyService: CourseHierarchyService,
      ) =>
        new RestoreCourseHandler(
          courseRepo,
          domainService,
          branchRepo,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CourseHierarchyService,
      ],
    },

    {
      provide: PermanentDeleteCourseHandler,
      useFactory: (
        courseRepo: CourseRepository,
        uploadDomainService: UploadDomainService,
        domainService: CourseDomainService,
      ) =>
        new PermanentDeleteCourseHandler(
          courseRepo,
          uploadDomainService,
          domainService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        UploadDomainService,
        CourseDomainService,
      ],
    },

    {
      provide: UpdateCourseStatusHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
        branchRepo: BranchRepository,
      ) =>
        new UpdateCourseStatusHandler(
          courseRepo,
          domainService,
          branchRepo,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },

    {
      provide: ReorderCoursesHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new ReorderCoursesHandler(courseRepo, domainService),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },

    {
      provide: BulkUpdateCourseStatusHandler,
      useFactory: (courseRepo: CourseRepository) =>
        new BulkUpdateCourseStatusHandler(courseRepo),
      inject: [COURSE_TOKENS.COURSE_REPOSITORY],
    },

    {
      provide: BulkDeleteCoursesHandler,
      useFactory: (
        courseRepo: CourseRepository,
        hierarchyService: CourseHierarchyService,
      ) =>
        new BulkDeleteCoursesHandler(
          courseRepo,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseHierarchyService,
      ],
    },

    {
      provide: BulkRestoreCoursesHandler,
      useFactory: (
        courseRepo: CourseRepository,
        hierarchyService: CourseHierarchyService,
      ) =>
        new BulkRestoreCoursesHandler(
          courseRepo,
          hierarchyService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseHierarchyService,
      ],
    },

    {
      provide: BulkPermanentDeleteCoursesHandler,
      useFactory: (courseRepo: CourseRepository) =>
        new BulkPermanentDeleteCoursesHandler(courseRepo),
      inject: [COURSE_TOKENS.COURSE_REPOSITORY],
    },

    {
      provide: GetCourseSummaryHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new GetCourseSummaryHandler(courseRepo, domainService),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },

    {
      provide: SuggestCourseCodeHandler,
      useFactory: (courseRepo: CourseRepository) =>
        new SuggestCourseCodeHandler(courseRepo),
      inject: [COURSE_TOKENS.COURSE_REPOSITORY],
    },

    {
      provide: GetCourseTrainersHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new GetCourseTrainersHandler(courseRepo, domainService),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },

    {
      provide: GetAvailableCourseTrainersHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new GetAvailableCourseTrainersHandler(
          courseRepo,
          domainService,
        ),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },

    {
      provide: AssignCourseTrainersHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new AssignCourseTrainersHandler(courseRepo, domainService),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },

    {
      provide: RemoveCourseTrainerHandler,
      useFactory: (
        courseRepo: CourseRepository,
        domainService: CourseDomainService,
      ) =>
        new RemoveCourseTrainerHandler(courseRepo, domainService),
      inject: [
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
      ],
    },
  ],

  exports: [
    COURSE_TOKENS.COURSE_REPOSITORY,
    CourseHierarchyService,
    CourseDomainService,
  ],
})
export class CourseModule {}
