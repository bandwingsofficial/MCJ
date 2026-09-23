import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { AdminDashboardService } from './application/admin-dashboard.service';
import { AdminDashboardController } from './presentation/controllers/admin-dashboard.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, SuperAdminGuard],
})
export class AdminDashboardModule {}
