import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreatePaymentOrderCommand } from '../../application/create-payment-order/create-payment-order.command';
import { CreatePaymentOrderHandler } from '../../application/create-payment-order/create-payment-order.handler';
import { GetMyPaymentHandler } from '../../application/get-my-payment/get-my-payment.handler';
import { GetMyPaymentQuery } from '../../application/get-my-payment/get-my-payment.query';
import { GetMyPaymentsHandler } from '../../application/get-my-payments/get-my-payments.handler';
import { GetMyPaymentsQuery } from '../../application/get-my-payments/get-my-payments.query';
import { HandlePaymentWebhookCommand } from '../../application/handle-payment-webhook/handle-payment-webhook.command';
import { HandlePaymentWebhookHandler } from '../../application/handle-payment-webhook/handle-payment-webhook.handler';
import { VerifyPaymentCommand } from '../../application/verify-payment/verify-payment.command';
import { VerifyPaymentHandler } from '../../application/verify-payment/verify-payment.handler';
import { CreatePaymentOrderDto } from '../dtos/create-payment-order.dto';
import { MyPaymentsQueryDto } from '../dtos/my-payments-query.dto';
import { VerifyPaymentDto } from '../dtos/verify-payment.dto';

@ApiTags('Payments')
@Controller('public/payments')
export class PublicPaymentController {
  constructor(
    private readonly createPaymentOrderHandler: CreatePaymentOrderHandler,
    private readonly verifyPaymentHandler: VerifyPaymentHandler,
    private readonly handlePaymentWebhookHandler: HandlePaymentWebhookHandler,
    private readonly getMyPaymentsHandler: GetMyPaymentsHandler,
    private readonly getMyPaymentHandler: GetMyPaymentHandler,
  ) {}

  @Post('create-order')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Razorpay order created' })
  async createOrder(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    const result = await this.createPaymentOrderHandler.execute(
      new CreatePaymentOrderCommand(user.sub, dto.enrollmentId),
    );

    return {
      success: true,
      message: 'Payment order created successfully',
      data: result,
    };
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Payment verified' })
  async verify(
    @CurrentUser() user: AuthUser,
    @Body() dto: VerifyPaymentDto,
  ) {
    const result = await this.verifyPaymentHandler.execute(
      new VerifyPaymentCommand(
        user.sub,
        dto.enrollmentId,
        dto.razorpayOrderId,
        dto.razorpayPaymentId,
        dto.razorpaySignature,
      ),
    );

    return {
      success: true,
      message: 'Payment verified successfully',
      data: result,
    };
  }

  // Public, unauthenticated endpoint — authenticity is established via the
  // Razorpay webhook signature, not a JWT.
  @Post('webhook')
  @ApiBody({ description: 'Razorpay webhook payload' })
  @ApiResponse({ status: 201, description: 'Webhook processed' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody
      ? req.rawBody.toString('utf8')
      : JSON.stringify(req.body ?? {});

    const result = await this.handlePaymentWebhookHandler.execute(
      new HandlePaymentWebhookCommand(rawBody, signature),
    );

    return {
      success: true,
      message: 'Webhook processed',
      data: result,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Current user payments fetched' })
  async getMyPayments(
    @CurrentUser() user: AuthUser,
    @Query() query: MyPaymentsQueryDto,
  ) {
    const result = await this.getMyPaymentsHandler.execute(
      new GetMyPaymentsQuery(
        user.sub,
        query.search,
        query.enrollmentId,
        query.paymentStatus,
        query.paymentMethod,
        query.gateway,
        query.skip,
        query.take,
        query.sortBy,
        query.sortOrder,
      ),
    );

    return {
      success: true,
      message: 'Payments fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Payment fetched' })
  async getMyPayment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const result = await this.getMyPaymentHandler.execute(
      new GetMyPaymentQuery(user.sub, id),
    );

    return {
      success: true,
      message: 'Payment fetched successfully',
      data: result,
    };
  }
}
