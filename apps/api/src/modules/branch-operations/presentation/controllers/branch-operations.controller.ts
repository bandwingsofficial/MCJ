import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InterviewStatus, JobApplicationStatus } from '@prisma/client';

import { CurrentBranchUser } from '@common/decorators/current-branch-user.decorator';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { BranchJwtAuthGuard } from '@common/guards/branch-jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { Permission } from '@modules/branch-user/domain/enums/permission.enum';

import { BranchAssessmentService } from '../../application/branch-assessment.service';
import { BranchAttendanceService } from '../../application/branch-attendance.service';
import { BranchBatchOpsService } from '../../application/branch-batch-ops.service';
import { BranchDashboardService } from '../../application/branch-dashboard.service';
import { BranchInterviewService } from '../../application/branch-interview.service';
import { BranchStaffService } from '../../application/branch-staff.service';
import {
  AssignFacultyDto,
  AssessmentQueryDto,
  AttendanceQueryDto,
  CreateAssessmentDto,
  CreateBranchStaffDto,
  EnrollmentListQueryDto,
  ListBranchStaffQueryDto,
  PunchAttendanceDto,
  RecordAttendanceDto,
  ResetBranchStaffPasswordDto,
  ScheduleInterviewDto,
  UpdateApplicationStatusDto,
  UpdateAssessmentDto,
  UpdateBranchStaffDto,
  UpdateInterviewDto,
} from '../dtos/branch-operations.dto';

const FacultyOrManager = [
  BranchUserRole.BRANCH_MANAGER,
  BranchUserRole.FACULTY,
] as const;

const BranchOpsReadRoles = [
  BranchUserRole.BRANCH_MANAGER,
  BranchUserRole.FACULTY,
  BranchUserRole.STAFF,
] as const;

const InterviewOrManager = [
  BranchUserRole.BRANCH_MANAGER,
  BranchUserRole.INTERVIEWER,
] as const;

@UseGuards(BranchJwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('branch')
export class BranchOperationsController {
  constructor(
    private readonly dashboard: BranchDashboardService,
    private readonly batches: BranchBatchOpsService,
    private readonly attendance: BranchAttendanceService,
    private readonly assessments: BranchAssessmentService,
    private readonly interviews: BranchInterviewService,
    private readonly staff: BranchStaffService,
  ) {}

  @Get('dashboard')
  @Roles(
    BranchUserRole.BRANCH_MANAGER,
    BranchUserRole.FACULTY,
    BranchUserRole.INTERVIEWER,
    BranchUserRole.STAFF,
    BranchUserRole.RECEPTIONIST,
    BranchUserRole.ACCOUNTANT,
    BranchUserRole.FACULTY_COORDINATOR,
    BranchUserRole.COUNSELOR,
  )
  async dashboardView(@CurrentBranchUser() user: BranchAuthUser) {
    return {
      success: true,
      message: 'Dashboard fetched successfully',
      data: await this.dashboard.getDashboard(user),
    };
  }

  @Get('batches')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.BATCH_READ)
  async listBatches(@CurrentBranchUser() user: BranchAuthUser) {
    return {
      success: true,
      message: 'Batches fetched successfully',
      data: await this.batches.listBatches(user),
    };
  }

  @Get('batches/:id')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.BATCH_READ)
  async getBatch(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'Batch fetched successfully',
      data: await this.batches.getBatch(user, id),
    };
  }

  @Get('batches/:id/students')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.STUDENT_READ)
  async batchStudents(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'Batch students fetched successfully',
      data: await this.batches.listBatchStudents(user, id),
    };
  }

  @Get('batches/:id/course')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.BATCH_READ)
  async batchCourse(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'Batch course fetched successfully',
      data: await this.batches.getBatchCourse(user, id),
    };
  }

  @Get('batches/:id/students/:studentId/activity')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.STUDENT_READ)
  async batchStudentActivity(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return {
      success: true,
      message: 'Student batch activity fetched successfully',
      data: await this.batches.getStudentBatchActivity(user, id, studentId),
    };
  }

  @Post('batches/:id/faculty')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_UPDATE)
  async assignFaculty(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: AssignFacultyDto,
  ) {
    return {
      success: true,
      message: 'Faculty assigned successfully',
      data: await this.batches.assignFaculty(user, id, dto.facultyId),
    };
  }

  @Delete('batches/:id/faculty/:facultyId')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_UPDATE)
  async unassignFaculty(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Param('facultyId') facultyId: string,
  ) {
    return {
      success: true,
      message: 'Faculty unassigned successfully',
      data: await this.batches.unassignFaculty(user, id, facultyId),
    };
  }

  @Get('enrollments')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.STUDENT_READ)
  async enrollments(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query() query: EnrollmentListQueryDto,
  ) {
    return {
      success: true,
      message: 'Enrollments fetched successfully',
      data: await this.batches.listEnrollments(user, query),
    };
  }

  @Get('students')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.STUDENT_READ)
  async students(@CurrentBranchUser() user: BranchAuthUser) {
    return {
      success: true,
      message: 'Students fetched successfully',
      data: await this.batches.listStudents(user),
    };
  }

  @Get('students/:id')
  @Roles(...BranchOpsReadRoles)
  @Permissions(Permission.STUDENT_READ)
  async student(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'Student fetched successfully',
      data: await this.batches.getStudent(user, id),
    };
  }

  @Get('attendance')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ATTENDANCE_READ)
  async listAttendance(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query() query: AttendanceQueryDto,
  ) {
    return {
      success: true,
      message: 'Attendance fetched successfully',
      data: await this.attendance.list(user, query),
    };
  }

  @Get('attendance/report')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ATTENDANCE_READ)
  async attendanceReport(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query() query: AttendanceQueryDto,
  ) {
    return {
      success: true,
      message: 'Attendance report fetched successfully',
      data: await this.attendance.report(user, query),
    };
  }

  @Post('attendance')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ATTENDANCE_WRITE)
  async recordAttendance(
    @CurrentBranchUser() user: BranchAuthUser,
    @Body() dto: RecordAttendanceDto,
  ) {
    return {
      success: true,
      message: 'Attendance saved successfully',
      data: await this.attendance.upsertAttendance(user, dto),
    };
  }

  @Post('attendance/punch')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ATTENDANCE_WRITE)
  async punch(
    @CurrentBranchUser() user: BranchAuthUser,
    @Body() dto: PunchAttendanceDto,
  ) {
    return {
      success: true,
      message: 'Punch recorded successfully',
      data: await this.attendance.punch(user, dto),
    };
  }

  @Get('assessments')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ASSESSMENT_READ)
  async listAssessments(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query() query: AssessmentQueryDto,
  ) {
    return {
      success: true,
      message: 'Assessments fetched successfully',
      data: await this.assessments.list(user, query),
    };
  }

  @Post('assessments')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ASSESSMENT_WRITE)
  async createAssessment(
    @CurrentBranchUser() user: BranchAuthUser,
    @Body() dto: CreateAssessmentDto,
  ) {
    return {
      success: true,
      message: 'Assessment saved successfully',
      data: await this.assessments.create(user, dto),
    };
  }

  @Patch('assessments/:id')
  @Roles(...FacultyOrManager)
  @Permissions(Permission.ASSESSMENT_WRITE)
  async updateAssessment(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    return {
      success: true,
      message: 'Assessment updated successfully',
      data: await this.assessments.update(user, id, dto),
    };
  }

  @Get('job-applications')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.JOB_APPLICATION_READ)
  async listApplications(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query('status') status?: JobApplicationStatus,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      message: 'Job applications fetched successfully',
      data: await this.interviews.listApplications(user, {
        status,
        search,
      }),
    };
  }

  @Get('job-applications/:id')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.JOB_APPLICATION_READ)
  async getApplication(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'Job application fetched successfully',
      data: await this.interviews.getApplication(user, id),
    };
  }

  @Patch('job-applications/:id/status')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.JOB_APPLICATION_UPDATE)
  async updateApplicationStatus(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return {
      success: true,
      message: 'Application status updated successfully',
      data: await this.interviews.updateApplicationStatus(
        user,
        id,
        dto.status,
      ),
    };
  }

  @Get('interviews')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.INTERVIEW_READ)
  async listInterviews(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query('status') status?: InterviewStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return {
      success: true,
      message: 'Interviews fetched successfully',
      data: await this.interviews.listInterviews(user, {
        status,
        from,
        to,
      }),
    };
  }

  @Post('interviews')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.INTERVIEW_WRITE)
  async scheduleInterview(
    @CurrentBranchUser() user: BranchAuthUser,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return {
      success: true,
      message: 'Interview scheduled successfully',
      data: await this.interviews.schedule(user, dto),
    };
  }

  @Patch('interviews/:id')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.INTERVIEW_WRITE)
  async updateInterview(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return {
      success: true,
      message: 'Interview updated successfully',
      data: await this.interviews.updateInterview(user, id, dto),
    };
  }

  @Get('placements')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.PLACEMENT_READ)
  async placements(@CurrentBranchUser() user: BranchAuthUser) {
    return {
      success: true,
      message: 'Placements fetched successfully',
      data: await this.interviews.listPlacements(user),
    };
  }

  @Get('placement-activity')
  @Roles(...InterviewOrManager)
  @Permissions(Permission.PLACEMENT_READ)
  async placementActivity(@CurrentBranchUser() user: BranchAuthUser) {
    return {
      success: true,
      message: 'Placement activity fetched successfully',
      data: await this.interviews.listPlacementActivity(user),
    };
  }

  @Get('users')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_READ)
  async listUsers(
    @CurrentBranchUser() user: BranchAuthUser,
    @Query() query: ListBranchStaffQueryDto,
  ) {
    return {
      success: true,
      message: 'Branch users fetched successfully',
      data: await this.staff.list(user, query),
    };
  }

  @Post('users')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_CREATE)
  async createUser(
    @CurrentBranchUser() user: BranchAuthUser,
    @Body() dto: CreateBranchStaffDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.staff.create(user, dto);

    if (data.restored) {
      res.status(HttpStatus.OK);
      return {
        success: true,
        message: 'Existing deleted user restored and updated successfully.',
        data,
      };
    }

    res.status(HttpStatus.CREATED);
    return {
      success: true,
      message: 'User created successfully.',
      data,
    };
  }

  @Patch('users/:id')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_UPDATE)
  async updateUser(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBranchStaffDto,
  ) {
    return {
      success: true,
      message: 'User updated successfully',
      data: await this.staff.update(user, id, dto),
    };
  }

  @Patch('users/:id/activate')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_ACTIVATE)
  async activateUser(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'User activated successfully',
      data: await this.staff.setActive(user, id, true),
    };
  }

  @Patch('users/:id/deactivate')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_DEACTIVATE)
  async deactivateUser(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'User deactivated successfully',
      data: await this.staff.setActive(user, id, false),
    };
  }

  @Patch('users/:id/reset-password')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_UPDATE)
  async resetUserPassword(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
    @Body() dto: ResetBranchStaffPasswordDto,
  ) {
    return {
      success: true,
      message: 'Password reset successfully',
      data: await this.staff.resetPassword(user, id, dto.newPassword),
    };
  }

  @Delete('users/:id/permanent')
  @Roles(
    BranchUserRole.BRANCH_MANAGER,
    BranchUserRole.FACULTY,
    BranchUserRole.INTERVIEWER,
  )
  async rejectPermanentDelete() {
    await this.staff.rejectPermanentDelete();
  }

  @Delete('users/:id')
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @Permissions(Permission.BRANCH_USER_DELETE)
  async deleteUser(
    @CurrentBranchUser() user: BranchAuthUser,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      message: 'User deleted successfully',
      data: await this.staff.remove(user, id),
    };
  }
}
