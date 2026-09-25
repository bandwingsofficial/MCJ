import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { CoinWalletService } from './application/coin-wallet.service';
import { RedemptionService } from './application/redemption.service';
import { ReferralQueryService } from './application/referral-query.service';
import { ReferralRegistrationService } from './application/referral-registration.service';
import { ReferralSettingsService } from './application/referral-settings.service';
import { AdminReferralRewardsController } from './presentation/controllers/admin-referral-rewards.controller';
import { CustomerReferralRewardsController } from './presentation/controllers/customer-referral-rewards.controller';
import { PublicReferralRewardsController } from './presentation/controllers/public-referral-rewards.controller';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [
    PublicReferralRewardsController,
    CustomerReferralRewardsController,
    AdminReferralRewardsController,
  ],
  providers: [
    SuperAdminGuard,
    ReferralSettingsService,
    CoinWalletService,
    ReferralRegistrationService,
    RedemptionService,
    ReferralQueryService,
  ],
  exports: [
    ReferralRegistrationService,
    ReferralSettingsService,
    CoinWalletService,
    ReferralQueryService,
  ],
})
export class ReferralRewardsModule {}
