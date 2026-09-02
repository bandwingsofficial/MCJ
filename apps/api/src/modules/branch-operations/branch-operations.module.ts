import { Module } from '@nestjs/common';

import { PermissionsGuard } from '@common/guards/permissions.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { BranchUserModule } from '../branch-user/branch-user.module';
import { JobApplicationModule } from '../job-application/job-application.module';

import { BranchOperationsAccessService } from './application/branch-operations-access.service';
import { BranchDashboardService } from './application/branch-dashboard.service';
import { FacultyDashboardService } from './application/faculty-dashboard.service';
import { BranchBatchOpsService } from './application/branch-batch-ops.service';
import { BranchAttendanceService } from './application/branch-attendance.service';
import { BranchAssessmentService } from './application/branch-assessment.service';
import { BranchInterviewService } from './application/branch-interview.service';
import { BranchStaffService } from './application/branch-staff.service';
import { BranchOperationsController } from './presentation/controllers/branch-operations.controller';

@Module({
  imports: [PrismaModule, BranchUserModule, JobApplicationModule],
  controllers: [BranchOperationsController],
  providers: [
    PermissionsGuard,
    BranchOperationsAccessService,
    BranchDashboardService,
    FacultyDashboardService,
    BranchBatchOpsService,
    BranchAttendanceService,
    BranchAssessmentService,
    BranchInterviewService,
    BranchStaffService,
  ],
})
export class BranchOperationsModule {}
