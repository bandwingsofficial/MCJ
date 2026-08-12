import {
  Body,
  Controller,
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
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

import { CreateManualPaymentCommand } from '../../application/create-manual-payment/create-manual-payment.command';
import { CreateManualPaymentHandler } from '../../application/create-manual-payment/create-manual-payment.handler';
import { GetPaymentHandler } from '../../application/get-payment/get-payment.handler';
import { GetPaymentQuery } from '../../application/get-payment/get-payment.query';
import { ListPaymentsHandler } from '../../application/list-payments/list-payments.handler';
import { ListPaymentsQuery } from '../../application/list-payments/list-payments.query';
import { UpdatePaymentCommand } from '../../application/update-payment/update-payment.command';
import { UpdatePaymentHandler } from '../../application/update-payment/update-payment.handler';
import { CreateManualPaymentDto } from '../dtos/create-manual-payment.dto';
import { ListPaymentsQueryDto } from '../dtos/list-payments-query.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';

const toDate = (value?: string) =>
  value ? new Date(value) : undefined;

@ApiTags('Admin Payments')
@ApiBearerAuth()
@Controller('admin/payments')
export class AdminPaymentController {
  constructor(
    private readonly createManualPaymentHandler: CreateManualPaymentHandler,
    private readonly listPaymentsHandler: ListPaymentsHandler,
    private readonly getPaymentHandler: GetPaymentHandler,
    private readonly updatePaymentHandler: UpdatePaymentHandler,
  ) {}

  @Post()
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  @ApiResponse({ status: 201, description: 'Manual payment recorded' })
  async create(
    @Body() dto: CreateManualPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createManualPaymentHandler.execute(
      new CreateManualPaymentCommand(
        dto.enrollmentId,
        dto.amount,
        dto.paymentMethod,
        dto.currency,
        dto.transactionId,
        dto.remarks,
        toDate(dto.paidAt),
        user.sub,
      ),
    );

    return {
      success: true,
      message: 'Payment recorded successfully',
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
  async list(@Query() query: ListPaymentsQueryDto) {
    const result = await this.listPaymentsHandler.execute(
      new ListPaymentsQuery(
        query.search,
        query.enrollmentId,
        query.studentId,
        query.paymentStatus,
        query.paymentMethod,
        query.gateway,
        query.includeDeleted,
        toDate(query.createdAtFrom),
        toDate(query.createdAtTo),
        query.skip,
        query.take,
        query.sortBy,
        query.sortOrder,
      ),
    );

    return {
      success: true,
      message: 'Payments fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async get(@Param('id') id: string) {
    const result = await this.getPaymentHandler.execute(
      new GetPaymentQuery(id, true),
    );

    return {
      success: true,
      message: 'Payment fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(JwtOrBranchJwtAuthGuard, AdminOrBranchRoleGuard)
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updatePaymentHandler.execute(
      new UpdatePaymentCommand(
        id,
        dto.remarks,
        dto.transactionId,
        dto.status,
        user.sub,
      ),
    );

    return {
      success: true,
      message: 'Payment updated successfully',
      data: result,
    };
  }
}
