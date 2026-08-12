import { Module, forwardRef } from '@nestjs/common';

import { AdminOrBranchRoleGuard } from '@common/guards/admin-or-branch-role.guard';
import { JwtOrBranchJwtAuthGuard } from '@common/guards/jwt-or-branch-jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';
import type { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { BranchUserModule } from '../branch-user/branch-user.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';
import { CreateProfileHandler } from '../profile/application/create-profile/create-profile.handler';
import type { ProfileRepository } from '../profile/domain/repositories/profile.repository';
import { ProfileModule } from '../profile/profile.module';
import { PROFILE_TOKENS } from '../profile/profile.tokens';

import { STUDENT_TOKENS } from './student.tokens';
import { CreateStudentHandler } from './application/create-student/create-student.handler';
import { CreateStudentByPublicHandler } from './application/create-student-by-public/create-student-by-public.handler';
import { GetMyStudentHandler } from './application/get-my-student/get-my-student.handler';
import { SyncStudentFromProfileHandler } from './application/sync-student-from-profile/sync-student-from-profile.handler';
import { UpdateMyStudentHandler } from './application/update-my-student/update-my-student.handler';
import { DeleteStudentHandler } from './application/delete-student/delete-student.handler';
import { GetStudentHandler } from './application/get-student/get-student.handler';
import { ListStudentsHandler } from './application/list-students/list-students.handler';
import { PermanentDeleteStudentHandler } from './application/permanent-delete-student/permanent-delete-student.handler';
import { RestoreStudentHandler } from './application/restore-student/restore-student.handler';
import { UpdateStudentHandler } from './application/update-student/update-student.handler';
import { UpdateStudentStatusHandler } from './application/update-student-status/update-student-status.handler';
import type { StudentRepository } from './domain/repositories/student.repository';
import { StudentDomainService } from './domain/services/student-domain.service';
import { PrismaStudentRepository } from './infrastructure/repositories/prisma-student.repository';
import { AdminStudentController } from './presentation/controllers/admin-student.controller';
import { PublicStudentController } from './presentation/controllers/public-student.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
    BranchUserModule,
    UploadsModule,
    forwardRef(() => ProfileModule),
  ],

  controllers: [AdminStudentController, PublicStudentController],

  providers: [
    StudentDomainService,
    SuperAdminGuard,
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,

    {
      provide: STUDENT_TOKENS.STUDENT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaStudentRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        branchRepo: BranchRepository,
        domainService: StudentDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateStudentHandler(
          studentRepo,
          branchRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        StudentDomainService,
        UploadDomainService,
      ],
    },

    {
      provide: CreateStudentByPublicHandler,
      useFactory: (
        studentRepo: StudentRepository,
        branchRepo: BranchRepository,
        profileRepo: ProfileRepository,
        domainService: StudentDomainService,
        createProfileHandler: CreateProfileHandler,
      ) =>
        new CreateStudentByPublicHandler(
          studentRepo,
          branchRepo,
          profileRepo,
          domainService,
          createProfileHandler,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        PROFILE_TOKENS.PROFILE_REPOSITORY,
        StudentDomainService,
        CreateProfileHandler,
      ],
    },

    {
      provide: SyncStudentFromProfileHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new SyncStudentFromProfileHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: GetMyStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new GetMyStudentHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: UpdateMyStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new UpdateMyStudentHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: UpdateStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        branchRepo: BranchRepository,
        uploadDomainService: UploadDomainService,
        domainService: StudentDomainService,
      ) =>
        new UpdateStudentHandler(
          studentRepo,
          branchRepo,
          uploadDomainService,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        UploadDomainService,
        StudentDomainService,
      ],
    },

    {
      provide: ListStudentsHandler,
      useFactory: (studentRepo: StudentRepository) =>
        new ListStudentsHandler(studentRepo),
      inject: [STUDENT_TOKENS.STUDENT_REPOSITORY],
    },

    {
      provide: GetStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new GetStudentHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: DeleteStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new DeleteStudentHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: RestoreStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new RestoreStudentHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },

    {
      provide: PermanentDeleteStudentHandler,
      useFactory: (
        studentRepo: StudentRepository,
        uploadDomainService: UploadDomainService,
        domainService: StudentDomainService,
      ) =>
        new PermanentDeleteStudentHandler(
          studentRepo,
          uploadDomainService,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        UploadDomainService,
        StudentDomainService,
      ],
    },

    {
      provide: UpdateStudentStatusHandler,
      useFactory: (
        studentRepo: StudentRepository,
        domainService: StudentDomainService,
      ) =>
        new UpdateStudentStatusHandler(
          studentRepo,
          domainService,
        ),
      inject: [
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        StudentDomainService,
      ],
    },
  ],

  exports: [
    STUDENT_TOKENS.STUDENT_REPOSITORY,
    StudentDomainService,
    SyncStudentFromProfileHandler,
  ],
})
export class StudentModule {}
