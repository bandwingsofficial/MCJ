import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { GetPlacementHandler } from '../../application/get-placement/get-placement.handler';
import { GetPlacementQuery } from '../../application/get-placement/get-placement.query';
import { ListPlacementsHandler } from '../../application/list-placements/list-placements.handler';
import { ListPlacementsQuery } from '../../application/list-placements/list-placements.query';
import { UpdatePlacementCommand } from '../../application/update-placement/update-placement.command';
import { UpdatePlacementHandler } from '../../application/update-placement/update-placement.handler';
import {
  ListPlacementsQueryDto,
  UpdatePlacementDto,
} from '../dtos/placement.dto';

@ApiTags('Admin Placements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/placements')
export class AdminPlacementController {
  constructor(
    private readonly listPlacementsHandler: ListPlacementsHandler,
    private readonly getPlacementHandler: GetPlacementHandler,
    private readonly updatePlacementHandler: UpdatePlacementHandler,
  ) {}

  @Get()
  async list(@Query() query: ListPlacementsQueryDto) {
    const result = await this.listPlacementsHandler.execute(
      new ListPlacementsQuery(
        query.jobId,
        query.userId,
        query.status,
        query.search,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Placements fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getPlacementHandler.execute(
      new GetPlacementQuery(id),
    );

    return {
      success: true,
      message: 'Placement fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updatePlacementHandler.execute(
      new UpdatePlacementCommand(
        id,
        dto.designation,
        dto.salary,
        dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        dto.remarks,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Placement updated successfully',
      data: result,
    };
  }
}
