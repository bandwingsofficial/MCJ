import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { AdminDashboardService } from '../../application/admin-dashboard.service';
import { AdminDashboardQueryDto } from '../dtos/admin-dashboard-query.dto';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get()
  async getDashboard(@Query() query: AdminDashboardQueryDto) {
    return {
      success: true,
      message: 'Admin dashboard fetched successfully',
      data: await this.adminDashboardService.getDashboard(query),
    };
  }
}
