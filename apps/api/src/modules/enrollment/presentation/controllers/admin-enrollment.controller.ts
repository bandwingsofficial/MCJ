import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminOrBranchRoleGuard } from '@common/guards/admin-or-branch-role.guard';
import { BranchAccessGuard } from '@common/guards/branch-access.guard';
import { JwtOrBranchJwtAuthGuard } from '@common/guards/jwt-or-branch-jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

import { ApproveEnrollmentCommand } from '../../application/approve-enrollment/approve-enrollment.command';
import { ApproveEnrollmentHandler } from '../../application/approve-enrollment/approve-enrollment.handler';
import { CreateEnrollmentCommand } from '../../application/create-enrollment/create-enrollment.command';
import { CreateEnrollmentHandler } from '../../application/create-enrollment/create-enrollment.handler';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { DeleteEnrollmentCommand } from '../../application/delete-enrollment/delete-enrollment.command';
import { DeleteEnrollmentHandler } from '../../application/delete-enrollment/delete-enrollment.handler';
import { GetEnrollmentHandler } from '../../application/get-enrollment/get-enrollment.handler';
import { GetEnrollmentQuery } from '../../application/get-enrollment/get-enrollment.query';
import { ListEnrollmentsHandler } from '../../application/list-enrollments/list-enrollments.handler';
import { ListEnrollmentsQuery } from '../../application/list-enrollments/list-enrollments.query';
import { PermanentDeleteEnrollmentCommand } from '../../application/permanent-delete-enrollment/permanent-delete-enrollment.command';
import { PermanentDeleteEnrollmentHandler } from '../../application/permanent-delete-enrollment/permanent-delete-enrollment.handler';
import { RejectEnrollmentCommand } from '../../application/reject-enrollment/reject-enrollment.command';
import { RejectEnrollmentHandler } from '../../application/reject-enrollment/reject-enrollment.handler';
import { RestoreEnrollmentCommand } from '../../application/restore-enrollment/restore-enrollment.command';
import { RestoreEnrollmentHandler } from '../../application/restore-enrollment/restore-enrollment.handler';
import { UnenrollEnrollmentCommand } from '../../application/unenroll-enrollment/unenroll-enrollment.command';
import { UnenrollEnrollmentHandler } from '../../application/unenroll-enrollment/unenroll-enrollment.handler';
import { UpdateEnrollmentCommand } from '../../application/update-enrollment/update-enrollment.command';
import { UpdateEnrollmentHandler } from '../../application/update-enrollment/update-enrollment.handler';
import { UpdateEnrollmentStatusCommand } from '../../application/update-enrollment-status/update-enrollment-status.command';
import { UpdateEnrollmentStatusHandler } from '../../application/update-enrollment-status/update-enrollment-status.handler';
import { CreateEnrollmentDto } from '../dtos/create-enrollment.dto';
import { ListEnrollmentsQueryDto } from '../dtos/list-enrollments-query.dto';
import { RejectEnrollmentDto } from '../dtos/reject-enrollment.dto';
import { UpdateEnrollmentDto } from '../dtos/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from '../dtos/update-enrollment-status.dto';
import { UnenrollEnrollmentDto } from '../dtos/unenroll-enrollment.dto';

type EnrollmentAdminUser = AuthUser & {
  branchId?: string;
};

const toDate = (value?: string) =>
  value ? new Date(value) : undefined;

@ApiTags('Admin Enrollments')
@ApiBearerAuth()
@Controller('admin/enrollments')
export class AdminEnrollmentController {
  constructor(
    private readonly createEnrollmentHandler: CreateEnrollmentHandler,
    private readonly updateEnrollmentHandler: UpdateEnrollmentHandler,
    private readonly updateEnrollmentStatusHandler: UpdateEnrollmentStatusHandler,
    private readonly listEnrollmentsHandler: ListEnrollmentsHandler,
    private readonly getEnrollmentHandler: GetEnrollmentHandler,
    private readonly deleteEnrollmentHandler: DeleteEnrollmentHandler,
    private readonly restoreEnrollmentHandler: RestoreEnrollmentHandler,
    private readonly permanentDeleteEnrollmentHandler: PermanentDeleteEnrollmentHandler,
    private readonly approveEnrollmentHandler: ApproveEnrollmentHandler,
    private readonly rejectEnrollmentHandler: RejectEnrollmentHandler,
    private readonly unenrollEnrollmentHandler: UnenrollEnrollmentHandler,
  ) {}

  @Post()
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  async create(
    @Body() dto: CreateEnrollmentDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.createEnrollmentHandler.execute(
      new CreateEnrollmentCommand(
        dto.studentId,
        dto.batchId,
        dto.feeAmount,
        dto.discountAmount ?? 0,
        dto.admissionDate ? new Date(dto.admissionDate) : undefined,
        dto.initialPaymentAmount,
        dto.paymentMethod,
        dto.transactionId,
        dto.initialPaymentPaidAt
          ? new Date(dto.initialPaymentPaidAt)
          : undefined,
        dto.installments ?? [],
        EnrollmentSource.ADMIN,
        user.sub,
        dto.branchId,
      ),
    );

    return {
      success: true,
      message: 'Enrollment created successfully',
      data: result,
    };
  }

  @Get()
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async list(
    @Query() query: ListEnrollmentsQueryDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.listEnrollmentsHandler.execute(
      new ListEnrollmentsQuery(
        query.search,
        query.studentId,
        this.resolveBranchId(query.branchId, user),
        query.categoryId,
        query.courseId,
        query.batchId,
        query.status,
        query.paymentStatus,
        query.source,
        query.isActive,
        query.includeDeleted,
        toDate(query.admissionDateFrom),
        toDate(query.admissionDateTo),
        toDate(query.createdAtFrom),
        toDate(query.createdAtTo),
        query.skip,
        query.take,
        query.sortBy,
        query.sortOrder,
        query.currentOnly,
      ),
    );

    return {
      success: true,
      message: 'Enrollments fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async get(
    @Param('id') id: string,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.getEnrollmentHandler.execute(
      new GetEnrollmentQuery(
        id,
        true,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.updateEnrollmentHandler.execute(
      new UpdateEnrollmentCommand(
        id,
        toDate(dto.admissionDate),
        toDate(dto.joiningDate),
        toDate(dto.expectedCompletionDate),
        dto.feeAmount,
        dto.discountAmount,
        dto.paidAmount,
        dto.remarks,
        dto.status,
        dto.isActive,
        dto.studentId,
        dto.batchId,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment updated successfully',
      data: result,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentStatusDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result =
      await this.updateEnrollmentStatusHandler.execute(
        new UpdateEnrollmentStatusCommand(
          id,
          dto.status,
          user.sub,
          this.resolveBranchId(undefined, user),
        ),
      );

    return {
      success: true,
      message: 'Enrollment status updated successfully',
      data: result,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.approveEnrollmentHandler.execute(
      new ApproveEnrollmentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment approved successfully',
      data: result,
    };
  }

  @Post(':id/reject')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectEnrollmentDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.rejectEnrollmentHandler.execute(
      new RejectEnrollmentCommand(
        id,
        dto.reason,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment rejected successfully',
      data: result,
    };
  }

  @Post(':id/unenroll')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER)
  @ApiResponse({ status: 200, description: 'Enrollment unenrolled' })
  async unenroll(
    @Param('id') id: string,
    @Body() dto: UnenrollEnrollmentDto,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.unenrollEnrollmentHandler.execute(
      new UnenrollEnrollmentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
        dto.reason,
      ),
    );

    const studentName = [
      result.student.firstName,
      result.student.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      success: true,
      message: studentName
        ? `${studentName} has been unenrolled successfully.`
        : 'Student has been unenrolled successfully.',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.deleteEnrollmentHandler.execute(
      new DeleteEnrollmentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: EnrollmentAdminUser,
  ) {
    const result = await this.restoreEnrollmentHandler.execute(
      new RestoreEnrollmentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Enrollment restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async permanentDelete(
    @Param('id') id: string,
    @CurrentUser() _user: AuthUser,
  ) {
    const result =
      await this.permanentDeleteEnrollmentHandler.execute(
        new PermanentDeleteEnrollmentCommand(id),
      );

    return {
      success: true,
      message: 'Enrollment permanently deleted successfully',
      data: result,
    };
  }

  private resolveBranchId(
    requestedBranchId: string | undefined,
    user: EnrollmentAdminUser,
  ): string | undefined {
    if (user.role === 'ADMIN') {
      return requestedBranchId;
    }

    return requestedBranchId ?? user.branchId;
  }
}
