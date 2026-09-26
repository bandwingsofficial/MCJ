import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CoinTransactionDirection,
  ReferralQualificationCondition,
  ReferralStatus,
} from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  CurrentUser,
  type AuthUser,
} from '../../../../common/decorators/current-user.decorator';
import { SuperAdminGuard } from '../../../../common/guards/super-admin.guard';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { ReferralQueryService } from '../../application/referral-query.service';
import { RedemptionBackfillService } from '../../application/redemption-backfill.service';
import { RedemptionService } from '../../application/redemption.service';
import { ReferralSettingsService } from '../../application/referral-settings.service';

class UpdateReferralSettingsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  referralEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewardCoinsPerReferral?: number;

  @IsOptional()
  @IsEnum(ReferralQualificationCondition)
  qualificationCondition?: ReferralQualificationCondition;

  @IsOptional()
  @IsInt()
  @Min(1)
  referralExpiryDays?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxReferralsPerReferrer?: number | null;

  @IsOptional()
  @IsBoolean()
  redemptionEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  coinsPerRupee?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minRedemptionCoins?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionCoins?: number | null;
}

class CreateReferralSettingsDto extends UpdateReferralSettingsDto {
  @IsString()
  declare name: string;
}

class WalletAdjustDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  reason!: string;
}

class RejectRedemptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('admin/referral-rewards')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminReferralRewardsController {
  constructor(
    private readonly queryService: ReferralQueryService,
    private readonly settingsService: ReferralSettingsService,
    private readonly redemptionService: RedemptionService,
    private readonly redemptionBackfillService: RedemptionBackfillService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return {
      data: await this.queryService.getAdminDashboardMetrics(),
    };
  }

  @Get('settings')
  async listSettings() {
    return {
      data: await this.settingsService.listSettings(),
    };
  }

  @Get('settings/active')
  async getActiveSettings() {
    return {
      data: await this.settingsService.getSettings(),
    };
  }

  @Post('settings')
  async createSettings(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateReferralSettingsDto,
  ) {
    return {
      data: await this.settingsService.createSettings(body, user.sub),
    };
  }

  @Put('settings')
  async updateActiveSettings(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateReferralSettingsDto,
  ) {
    return {
      data: await this.settingsService.updateActiveSettings(body, user.sub),
    };
  }

  @Put('settings/:id')
  async updateSettingsById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateReferralSettingsDto,
  ) {
    return {
      data: await this.settingsService.updateSettings(id, body, user.sub),
    };
  }

  @Post('settings/:id/activate')
  async activateSettings(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return {
      data: await this.settingsService.activateSettings(id, user.sub),
    };
  }

  @Get('referrals')
  async listReferrals(
    @Query('search') search?: string,
    @Query('status') status?: ReferralStatus,
    @Query('referralCode') referralCode?: string,
    @Query('referrerUserId') referrerUserId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.queryService.listAdminReferrals({
      search,
      status,
      referralCode,
      referrerUserId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    }),
    };
  }

  @Get('referrals/:id')
  async getReferral(@Param('id') id: string) {
    return {
      data: await this.queryService.getAdminReferralById(id),
    };
  }

  @Get('referral-users')
  async listReferralUsers(
    @Query('search') search?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.queryService.listReferralCodeUsageStats({
        search,
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      }),
    };
  }

  @Get('users/:userId/summary')
  async getUserSummary(@Param('userId') userId: string) {
    return {
      data: await this.queryService.getAdminUserReferralSummary(userId),
    };
  }

  @Get('coin-transactions')
  async listCoinTransactions(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('direction') direction?: CoinTransactionDirection,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.queryService.listAdminCoinTransactions({
        userId,
        type,
        direction,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      }),
    };
  }

  @Get('redemptions')
  async listRedemptions(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.queryService.listAdminRedemptions({
        search,
        status,
        userId,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      }),
    };
  }

  @Post('redemptions/backfill-missing')
  async backfillMissingRedemptions() {
    return {
      data: await this.redemptionBackfillService.backfillMissingRedemptions(),
    };
  }

  @Post('coin-transactions/repair-balances')
  async repairCoinTransactionBalances() {
    return {
      data: {
        repaired:
          await this.redemptionBackfillService.repairIncorrectCoinTransactionBalances(),
      },
    };
  }

  @Get('redemptions/:id')
  async getRedemption(@Param('id') id: string) {
    return {
      data: await this.queryService.getAdminRedemptionById(id),
    };
  }

  @Post('redemptions/:id/approve')
  async approveRedemption(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return {
      data: await this.redemptionService.approveRedemption(id, user.sub),
    };
  }

  @Post('redemptions/:id/reject')
  async rejectRedemption(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: RejectRedemptionDto,
  ) {
    return {
      data: await this.redemptionService.rejectRedemption(id, user.sub, body.reason),
    };
  }

  @Post('redemptions/:id/process')
  async processRedemption(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return {
      data: await this.redemptionService.processRedemption(id, user.sub),
    };
  }

  @Post('wallets/:userId/credit')
  async creditWallet(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: WalletAdjustDto,
  ) {
    return {
      data: await this.redemptionService.adminAdjustWallet(
        userId,
        'CREDIT',
        body.amount,
        body.reason,
        user.sub,
      ),
    };
  }

  @Post('wallets/:userId/debit')
  async debitWallet(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: WalletAdjustDto,
  ) {
    return {
      data: await this.redemptionService.adminAdjustWallet(
        userId,
        'DEBIT',
        body.amount,
        body.reason,
        user.sub,
      ),
    };
  }
}
