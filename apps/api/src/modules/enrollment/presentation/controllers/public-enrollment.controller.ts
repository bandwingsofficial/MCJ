import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreatePublicEnrollmentCommand } from '../../application/create-public-enrollment/create-public-enrollment.command';
import { ApplyEnrollmentCoinsHandler } from '../../application/apply-enrollment-coins/apply-enrollment-coins.handler';
import { ApplyEnrollmentCoinsCommand } from '../../application/apply-enrollment-coins/apply-enrollment-coins.command';
import { RemoveEnrollmentCoinsHandler } from '../../application/remove-enrollment-coins/remove-enrollment-coins.handler';
import { RemoveEnrollmentCoinsCommand } from '../../application/remove-enrollment-coins/remove-enrollment-coins.command';
import { CreatePublicEnrollmentHandler } from '../../application/create-public-enrollment/create-public-enrollment.handler';
import { CreatePublicEnrollmentCheckoutHandler } from '../../application/create-public-enrollment-checkout/create-public-enrollment-checkout.handler';
import { CreatePublicEnrollmentCheckoutCommand } from '../../application/create-public-enrollment-checkout/create-public-enrollment-checkout.command';
import { GetMyEnrollmentByIdHandler } from '../../application/get-my-enrollment-by-id/get-my-enrollment-by-id.handler';
import { GetMyEnrollmentByIdQuery } from '../../application/get-my-enrollment-by-id/get-my-enrollment-by-id.query';
import { GetMyEnrollmentHandler } from '../../application/get-my-enrollment/get-my-enrollment.handler';
import { GetMyEnrollmentQuery } from '../../application/get-my-enrollment/get-my-enrollment.query';
import { ApplyEnrollmentCoinsDto } from '../dtos/apply-enrollment-coins.dto';
import { CreatePublicEnrollmentDto } from '../dtos/create-public-enrollment.dto';
import { CreatePublicEnrollmentCheckoutDto } from '../dtos/create-public-enrollment-checkout.dto';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class PublicEnrollmentController {
  constructor(
    private readonly createPublicEnrollmentHandler: CreatePublicEnrollmentHandler,
    private readonly createPublicEnrollmentCheckoutHandler: CreatePublicEnrollmentCheckoutHandler,
    private readonly applyEnrollmentCoinsHandler: ApplyEnrollmentCoinsHandler,
    private readonly removeEnrollmentCoinsHandler: RemoveEnrollmentCoinsHandler,
    private readonly getMyEnrollmentHandler: GetMyEnrollmentHandler,
    private readonly getMyEnrollmentByIdHandler: GetMyEnrollmentByIdHandler,
  ) {}

  @Post('checkout-order')
  @ApiBody({ type: CreatePublicEnrollmentCheckoutDto })
  @ApiResponse({
    status: 201,
    description: 'Razorpay order for public enrollment checkout',
  })
  async createCheckoutOrder(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePublicEnrollmentCheckoutDto,
  ) {
    const result =
      await this.createPublicEnrollmentCheckoutHandler.execute(
        new CreatePublicEnrollmentCheckoutCommand(
          user.sub,
          dto.batchId,
          dto.batchTimingId,
          dto.branchId,
          dto.courseId,
          dto.coinsToRedeem ?? 0,
        ),
      );

    return {
      success: true,
      message: 'Enrollment checkout order created successfully',
      data: result,
    };
  }

  @Post()
  @ApiBody({ type: CreatePublicEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePublicEnrollmentDto,
  ) {
    const result =
      await this.createPublicEnrollmentHandler.execute(
        new CreatePublicEnrollmentCommand(
          user.sub,
          dto.batchId,
          dto.batchTimingId,
          dto.branchId,
          dto.courseId,
        ),
      );

    return {
      success: true,
      message: 'Enrollment created successfully',
      data: result,
    };
  }

  @Post(':id/apply-coins')
  @ApiBody({ type: ApplyEnrollmentCoinsDto })
  async applyCoins(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ApplyEnrollmentCoinsDto,
  ) {
    const result = await this.applyEnrollmentCoinsHandler.execute(
      new ApplyEnrollmentCoinsCommand(user.sub, id, dto.coins),
    );

    return {
      success: true,
      message: 'Coins applied successfully',
      data: result,
    };
  }

  @Post(':id/remove-coins')
  async removeCoins(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const result = await this.removeEnrollmentCoinsHandler.execute(
      new RemoveEnrollmentCoinsCommand(user.sub, id),
    );

    return {
      success: true,
      message: 'Applied coins removed successfully',
      data: result,
    };
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Current user enrollments fetched',
  })
  async getMyEnrollments(@CurrentUser() user: AuthUser) {
    const result = await this.getMyEnrollmentHandler.execute(
      new GetMyEnrollmentQuery(user.sub),
    );

    return {
      success: true,
      message: 'Enrollments fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Enrollment detail fetched',
  })
  async getMyEnrollment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const result = await this.getMyEnrollmentByIdHandler.execute(
      new GetMyEnrollmentByIdQuery(user.sub, id),
    );

    return {
      success: true,
      message: 'Enrollment fetched successfully',
      data: result,
    };
  }
}
