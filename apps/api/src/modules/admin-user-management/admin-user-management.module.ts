import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ReferralRewardsModule } from '../referral-rewards/referral-rewards.module';

import { AdminUserManagementService } from './application/admin-user-management.service';
import { UserAccountLifecycleService } from './application/user-account-lifecycle.service';
import { AdminUserManagementController } from './presentation/admin-user-management.controller';
import { CustomerAccountController } from './presentation/customer-account.controller';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), ReferralRewardsModule],
  controllers: [AdminUserManagementController, CustomerAccountController],
  providers: [
    SuperAdminGuard,
    AdminUserManagementService,
    UserAccountLifecycleService,
  ],
  exports: [UserAccountLifecycleService],
})
export class AdminUserManagementModule {}
