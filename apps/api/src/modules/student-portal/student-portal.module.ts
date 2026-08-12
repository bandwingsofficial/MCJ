import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { CourseModule } from '../course/course.module';
import { CourseHierarchyService } from '../course/infrastructure/services/course-hierarchy.service';
import { COURSE_TOKENS } from '../course/course.tokens';
import type { CourseRepository } from '../course/domain/repositories/course.repository';
import { CourseDomainService } from '../course/domain/services/course-domain.service';
import { BranchModule } from '../branch/branch.module';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import type { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { ENROLLMENT_TOKENS } from '../enrollment/enrollment.tokens';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import type { EnrollmentRepository } from '../enrollment/domain/repositories/enrollment.repository';
import { STUDENT_TOKENS } from '../student/student.tokens';
import { StudentModule } from '../student/student.module';
import type { StudentRepository } from '../student/domain/repositories/student.repository';

import { GetStudentPortalAccessHandler } from './application/get-student-portal-access/get-student-portal-access.handler';
import { ListStudentCoursesHandler } from './application/list-student-courses/list-student-courses.handler';
import { GetStudentCourseHandler } from './application/get-student-course/get-student-course.handler';
import {
  GetStudentCourseLessonHandler,
  GetStudentCourseModuleHandler,
} from './application/get-student-course/get-student-course.handler';
import {
  DownloadStudentResourceHandler,
  GetStudentCourseCompletionHandler,
  GetStudentCourseProgressHandler,
  UpdateLessonProgressHandler,
} from './application/student-course-progress/student-course-progress.handler';
import { CourseAccessService } from './domain/services/course-access.service';
import type { LessonProgressRepository } from './domain/repositories/lesson-progress.repository';
import { PrismaLessonProgressRepository } from './infrastructure/repositories/prisma-lesson-progress.repository';
import { StudentPortalController } from './presentation/controllers/student-portal.controller';
import {
  StudentCourseController,
  StudentResourceController,
} from './presentation/controllers/student-course.controller';
import { STUDENT_PORTAL_TOKENS } from './student-portal.tokens';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StudentModule,
    EnrollmentModule,
    CourseModule,
    BranchModule,
  ],

  controllers: [
    StudentPortalController,
    StudentCourseController,
    StudentResourceController,
  ],

  providers: [
    CourseAccessService,
    {
      provide: STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaLessonProgressRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: GetStudentPortalAccessHandler,
      useFactory: (
        studentRepo: StudentRepository,
        enrollmentRepo: EnrollmentRepository,
      ) =>
        new GetStudentPortalAccessHandler(
          studentRepo,
          enrollmentRepo,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
      ],
    },
    {
      provide: ListStudentCoursesHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        enrollmentRepo: EnrollmentRepository,
      ) =>
        new ListStudentCoursesHandler(
          courseAccessService,
          enrollmentRepo,
        ),
      inject: [CourseAccessService, ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY],
    },
    {
      provide: GetStudentCourseHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        courseRepo: CourseRepository,
        courseDomainService: CourseDomainService,
        branchRepo: BranchRepository,
        hierarchyService: CourseHierarchyService,
        lessonProgressRepo: LessonProgressRepository,
      ) =>
        new GetStudentCourseHandler(
          courseAccessService,
          courseRepo,
          courseDomainService,
          branchRepo,
          hierarchyService,
          lessonProgressRepo,
        ),
      inject: [
        CourseAccessService,
        COURSE_TOKENS.COURSE_REPOSITORY,
        CourseDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CourseHierarchyService,
        STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      ],
    },
    {
      provide: GetStudentCourseModuleHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
      ) =>
        new GetStudentCourseModuleHandler(
          courseAccessService,
          hierarchyService,
        ),
      inject: [CourseAccessService, CourseHierarchyService],
    },
    {
      provide: GetStudentCourseLessonHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
        lessonProgressRepo: LessonProgressRepository,
      ) =>
        new GetStudentCourseLessonHandler(
          courseAccessService,
          hierarchyService,
          lessonProgressRepo,
        ),
      inject: [
        CourseAccessService,
        CourseHierarchyService,
        STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      ],
    },
    {
      provide: GetStudentCourseProgressHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
        lessonProgressRepo: LessonProgressRepository,
      ) =>
        new GetStudentCourseProgressHandler(
          courseAccessService,
          hierarchyService,
          lessonProgressRepo,
        ),
      inject: [
        CourseAccessService,
        CourseHierarchyService,
        STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      ],
    },
    {
      provide: UpdateLessonProgressHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
        lessonProgressRepo: LessonProgressRepository,
      ) =>
        new UpdateLessonProgressHandler(
          courseAccessService,
          hierarchyService,
          lessonProgressRepo,
        ),
      inject: [
        CourseAccessService,
        CourseHierarchyService,
        STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      ],
    },
    {
      provide: GetStudentCourseCompletionHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
        lessonProgressRepo: LessonProgressRepository,
      ) =>
        new GetStudentCourseCompletionHandler(
          courseAccessService,
          hierarchyService,
          lessonProgressRepo,
        ),
      inject: [
        CourseAccessService,
        CourseHierarchyService,
        STUDENT_PORTAL_TOKENS.LESSON_PROGRESS_REPOSITORY,
      ],
    },
    {
      provide: DownloadStudentResourceHandler,
      useFactory: (
        courseAccessService: CourseAccessService,
        hierarchyService: CourseHierarchyService,
      ) =>
        new DownloadStudentResourceHandler(
          courseAccessService,
          hierarchyService,
        ),
      inject: [CourseAccessService, CourseHierarchyService],
    },
  ],
})
export class StudentPortalModule {}
