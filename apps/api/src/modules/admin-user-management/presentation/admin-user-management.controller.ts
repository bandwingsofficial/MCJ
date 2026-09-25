import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import {
  CurrentUser,
  type AuthUser,
} from '../../../common/decorators/current-user.decorator';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { ReferralQueryService } from '../../referral-rewards/application/referral-query.service';
import { AdminUserManagementService } from '../application/admin-user-management.service';
import { UserAccountLifecycleService } from '../application/user-account-lifecycle.service';

class SuspendUserDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

class DeleteUserDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminUserManagementController {
  constructor(
    private readonly users: AdminUserManagementService,
    private readonly lifecycle: UserAccountLifecycleService,
    private readonly referralQuery: ReferralQueryService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    return { data: await this.users.getDashboardMetrics() };
  }

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('accountStatus') accountStatus?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED',
    @Query('referral') referral?: 'ALL' | 'HAS_REFERRAL' | 'NO_REFERRAL',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.users.listUsers({
        search,
        accountStatus: accountStatus ?? 'ALL',
        referral: referral ?? 'ALL',
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      }),
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return { data: await this.users.getUserDetails(id) };
  }

  @Get(':id/referrals')
  async getReferrals(@Param('id') id: string) {
    return { data: await this.referralQuery.getAdminUserReferralSummary(id) };
  }

  @Get(':id/coin-transactions')
  async getTransactions(
    @Param('id') id: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.referralQuery.listAdminCoinTransactions({
        userId: id,
        take: take ? Number(take) : 50,
        skip: skip ? Number(skip) : 0,
      }),
    };
  }

  @Get(':id/redemptions')
  async getRedemptions(@Param('id') id: string) {
    return {
      data: await this.referralQuery.listAdminRedemptions({ userId: id, take: 50 }),
    };
  }

  @Post(':id/suspend')
  async suspend(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
    @Body() body: SuspendUserDto,
  ) {
    await this.lifecycle.suspendUser(id, admin.sub, body.reason);
    return { data: { success: true } };
  }

  @Post(':id/unsuspend')
  async unsuspend(@Param('id') id: string) {
    await this.lifecycle.unsuspendUser(id);
    return { data: { success: true } };
  }

  @Post(':id/delete-permanently')
  async deletePermanently(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
    @Body() body: DeleteUserDto,
  ) {
    return {
      data: await this.lifecycle.permanentlyDeleteUser({
        userId: id,
        actorUserId: admin.sub,
        reason: body.reason,
        source: 'ADMIN',
      }),
    };
  }
}
