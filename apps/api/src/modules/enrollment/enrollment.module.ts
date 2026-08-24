import { Module ,forwardRef  } from '@nestjs/common';

import { AdminOrBranchRoleGuard } from '@common/guards/admin-or-branch-role.guard';
import { JwtOrBranchJwtAuthGuard } from '@common/guards/jwt-or-branch-jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { BATCH_TOKENS } from '../batch/batch.tokens';
import { BatchModule } from '../batch/batch.module';
import type { BatchRepository } from '../batch/domain/repositories/batch.repository';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';
import type { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { BranchUserModule } from '../branch-user/branch-user.module';
import { CATEGORY_TOKENS } from '../category/category.tokens';
import { CategoryModule } from '../category/category.module';
import type { CategoryRepository } from '../category/domain/repositories/category.repository';
import { COURSE_TOKENS } from '../course/course.tokens';
import { CourseModule } from '../course/course.module';
import type { CourseRepository } from '../course/domain/repositories/course.repository';
import { STUDENT_TOKENS } from '../student/student.tokens';
import { StudentModule } from '../student/student.module';
import type { StudentRepository } from '../student/domain/repositories/student.repository';
import { ENROLLMENT_TOKENS } from './enrollment.tokens';
import { ApproveEnrollmentHandler } from './application/approve-enrollment/approve-enrollment.handler';
import { CreateEnrollmentHandler } from './application/create-enrollment/create-enrollment.handler';
import { CreatePublicEnrollmentHandler } from './application/create-public-enrollment/create-public-enrollment.handler';
import { DeleteEnrollmentHandler } from './application/delete-enrollment/delete-enrollment.handler';
import { GetEnrollmentHandler } from './application/get-enrollment/get-enrollment.handler';
import { GetMyEnrollmentByIdHandler } from './application/get-my-enrollment-by-id/get-my-enrollment-by-id.handler';
import { GetMyEnrollmentHandler } from './application/get-my-enrollment/get-my-enrollment.handler';
import { ListEnrollmentsHandler } from './application/list-enrollments/list-enrollments.handler';
import { PermanentDeleteEnrollmentHandler } from './application/permanent-delete-enrollment/permanent-delete-enrollment.handler';
import { RejectEnrollmentHandler } from './application/reject-enrollment/reject-enrollment.handler';
import { RestoreEnrollmentHandler } from './application/restore-enrollment/restore-enrollment.handler';
import { EnrollmentSideEffectsService } from './application/shared/enrollment-side-effects.service';
import { UpdateEnrollmentHandler } from './application/update-enrollment/update-enrollment.handler';
import { UpdateEnrollmentStatusHandler } from './application/update-enrollment-status/update-enrollment-status.handler';
import type { EnrollmentRepository } from './domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from './domain/services/enrollment-domain.service';
import { PrismaEnrollmentRepository } from './infrastructure/repositories/prisma-enrollment.repository';
import { AdminEnrollmentController } from './presentation/controllers/admin-enrollment.controller';
import { PublicEnrollmentController } from './presentation/controllers/public-enrollment.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
    BranchUserModule,
    CategoryModule,
    forwardRef(() => CourseModule),
    forwardRef(() => BatchModule),
    StudentModule,
  ],

  controllers: [
    AdminEnrollmentController,
    PublicEnrollmentController,
  ],

  providers: [
    EnrollmentDomainService,
    SuperAdminGuard,
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,

    {
      provide: ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaEnrollmentRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: EnrollmentSideEffectsService,
      useFactory: (
        batchRepo: BatchRepository,
        studentRepo: StudentRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new EnrollmentSideEffectsService(
          batchRepo,
          studentRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        EnrollmentDomainService,
      ],
    },

    {
      provide: CreateEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        studentRepo: StudentRepository,
        branchRepo: BranchRepository,
        categoryRepo: CategoryRepository,
        courseRepo: CourseRepository,
        batchRepo: BatchRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new CreateEnrollmentHandler(
          enrollmentRepo,
          studentRepo,
          branchRepo,
          categoryRepo,
          courseRepo,
          batchRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        BATCH_TOKENS.BATCH_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: CreatePublicEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        studentRepo: StudentRepository,
        branchRepo: BranchRepository,
        categoryRepo: CategoryRepository,
        courseRepo: CourseRepository,
        batchRepo: BatchRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new CreatePublicEnrollmentHandler(
          enrollmentRepo,
          studentRepo,
          branchRepo,
          categoryRepo,
          courseRepo,
          batchRepo,
          domainService,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        BATCH_TOKENS.BATCH_REPOSITORY,
        EnrollmentDomainService,
      ],
    },

    {
      provide: UpdateEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new UpdateEnrollmentHandler(
          enrollmentRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: UpdateEnrollmentStatusHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new UpdateEnrollmentStatusHandler(
          enrollmentRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: ListEnrollmentsHandler,
      useFactory: (enrollmentRepo: EnrollmentRepository) =>
        new ListEnrollmentsHandler(enrollmentRepo),
      inject: [ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY],
    },

    {
      provide: GetEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new GetEnrollmentHandler(enrollmentRepo, domainService),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
      ],
    },

    {
      provide: GetMyEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        studentRepo: StudentRepository,
      ) =>
        new GetMyEnrollmentHandler(enrollmentRepo, studentRepo),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
      ],
    },

    {
      provide: GetMyEnrollmentByIdHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        studentRepo: StudentRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new GetMyEnrollmentByIdHandler(
          enrollmentRepo,
          studentRepo,
          domainService,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        EnrollmentDomainService,
      ],
    },

    {
      provide: ApproveEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        batchRepo: BatchRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new ApproveEnrollmentHandler(
          enrollmentRepo,
          batchRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        BATCH_TOKENS.BATCH_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: RejectEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new RejectEnrollmentHandler(enrollmentRepo, domainService),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
      ],
    },

    {
      provide: DeleteEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new DeleteEnrollmentHandler(
          enrollmentRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: RestoreEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
        sideEffects: EnrollmentSideEffectsService,
      ) =>
        new RestoreEnrollmentHandler(
          enrollmentRepo,
          domainService,
          sideEffects,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
        EnrollmentSideEffectsService,
      ],
    },

    {
      provide: PermanentDeleteEnrollmentHandler,
      useFactory: (
        enrollmentRepo: EnrollmentRepository,
        domainService: EnrollmentDomainService,
      ) =>
        new PermanentDeleteEnrollmentHandler(
          enrollmentRepo,
          domainService,
        ),
      inject: [
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        EnrollmentDomainService,
      ],
    },
  ],

  exports: [
    ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
    EnrollmentDomainService,
    EnrollmentSideEffectsService,
  ],
})
export class EnrollmentModule {}
