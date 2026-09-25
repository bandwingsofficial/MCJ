import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoinTransactionDirection } from '@prisma/client';
import { IsInt, Min } from 'class-validator';

import {
  CurrentUser,
  type AuthUser,
} from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { ReferralQueryService } from '../../application/referral-query.service';
import { RedemptionService } from '../../application/redemption.service';

class CreateRedemptionDto {
  @IsInt()
  @Min(1)
  coins!: number;
}

@Controller('referral-rewards')
@UseGuards(JwtAuthGuard)
export class CustomerReferralRewardsController {
  constructor(
    private readonly queryService: ReferralQueryService,
    private readonly redemptionService: RedemptionService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return {
      data: await this.queryService.getCustomerSummary(user.sub),
    };
  }

  @Get('wallet/transactions')
  async listTransactions(
    @CurrentUser() user: AuthUser,
    @Query('direction') direction?: CoinTransactionDirection,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return {
      data: await this.queryService.listCustomerTransactions(user.sub, {
        direction,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        take: take ? Number(take) : undefined,
        skip: skip ? Number(skip) : undefined,
      }),
    };
  }

  @Get('wallet/redemptions')
  async listRedemptions(@CurrentUser() user: AuthUser) {
    return {
      data: await this.queryService.listCustomerRedemptions(user.sub),
    };
  }

  @Post('redemptions')
  async createRedemption(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateRedemptionDto,
  ) {
    return {
      data: await this.redemptionService.createRedemptionRequest(
        user.sub,
        body.coins,
      ),
    };
  }
}
