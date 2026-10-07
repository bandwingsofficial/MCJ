import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';

import { BannerService } from './banner.service';
import { AdminBannerController } from './presentation/admin-banner.controller';
import { BannerController } from './presentation/banner.controller';

@Module({
  imports: [PrismaModule, AuthModule, UploadsModule],
  controllers: [AdminBannerController, BannerController],
  providers: [BannerService, SuperAdminGuard],
})
export class BannerModule {}
