// presentation/controllers/admin-auth.controller.ts

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { LoginAdminHandler } from '../../application/admin/login/login-admin.handler';

import { VerifyAdminTotpHandler } from '../../application/admin/verify-admin-totp/verify-admin-totp.handler';

import { LoginAdminCommand } from '../../application/admin/login/login-admin.command';

import { VerifyAdminTotpCommand } from '../../application/admin/verify-admin-totp/verify-admin-totp.command';

import { LoginAdminDto } from '../dtos/login-admin.dto';

import { VerifyAdminTotpDto } from '../dtos/verify-admin-totp.dto';

import {
  getClientIp,
  getUserAgent,
} from '../../application/utils/request.util';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly loginAdminHandler: LoginAdminHandler,

    private readonly verifyAdminTotpHandler: VerifyAdminTotpHandler,
  ) {}

  // =====================
  // 🔐 ADMIN LOGIN
  // =====================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginAdminDto,

    @Req() req: Request,
  ) {
    const result = await this.loginAdminHandler.execute(
      new LoginAdminCommand(
        dto.email,

        dto.password,

        getClientIp(req),
        getUserAgent(req),
      ),
    );

    return {
      message: 'MFA verification required',

      data: result,
    };
  }

  // =====================
  // 🔢 VERIFY TOTP
  // =====================

  @Post('verify-totp')
  @HttpCode(HttpStatus.OK)
  async verifyTotp(
    @Body()
    dto: VerifyAdminTotpDto,

    @Req() req: Request,
  ) {
      const result = await this.verifyAdminTotpHandler.execute(
      new VerifyAdminTotpCommand(
        dto.mfaToken,

        dto.totpCode,

        getUserAgent(req),
        getClientIp(req),

        dto.clientType,
      ),
    );

    return {
      message: 'Admin login successful',

      data: result,
    };
  }
}
