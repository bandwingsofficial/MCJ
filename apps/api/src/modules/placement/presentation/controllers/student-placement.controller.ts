import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { GetMyPlacementHandler } from '../../application/get-my-placement/get-my-placement.handler';
import { GetMyPlacementQuery } from '../../application/get-my-placement/get-my-placement.query';

@ApiTags('My Placement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my-placement')
export class StudentPlacementController {
  constructor(
    private readonly getMyPlacementHandler: GetMyPlacementHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'My placement fetched' })
  async getMyPlacement(@CurrentUser() user: AuthUser) {
    const result = await this.getMyPlacementHandler.execute(
      new GetMyPlacementQuery(user.sub),
    );

    return {
      success: true,
      message: 'Placement fetched successfully',
      data: result,
    };
  }
}
