import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

// =====================
// AUTH HANDLERS
// =====================

import { RegisterUserHandler } from '../../application/register/register-user.handler';
import { RegisterUserCommand } from '../../application/register/register-user.command';

import { LoginUserHandler } from '../../application/login/login-user.handler';
import { LoginUserCommand } from '../../application/login/login-user.command';

import { RefreshTokenHandler } from '../../application/refresh/refresh-token.handler';
import { RefreshTokenCommand } from '../../application/refresh/refresh-token.command';

import { LogoutCommand } from '../../application/logout/logout.command';
import { LogoutHandler } from '../../application/logout/logout.handler';

import { ListSessionsQuery } from '../../application/session/list-sessions.query';
import { ListSessionsHandler } from '../../application/session/list-sessions.handler';

import { RevokeSessionCommand } from '../../application/session/revoke-session.command';
import { RevokeSessionHandler } from '../../application/session/revoke-session.handler';

import { LogoutAllCommand } from '../../application/session/logout-all.command';
import { LogoutAllHandler } from '../../application/session/logout-all.handler';

// =====================
// 🔥 RESET PASSWORD HANDLERS
// =====================

import { RequestPasswordResetHandler } from '../../application/password-reset/request-password-reset.handler';
import { RequestPasswordResetCommand } from '../../application/password-reset/request-password-reset.command';

import { ResetPasswordHandler } from '../../application/password-reset/reset-password.handler';
import { ResetPasswordCommand } from '../../application/password-reset/reset-password.command';

// =====================
// DTOs
// =====================

import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginUserHandler,
    private readonly refreshHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly listSessionsHandler: ListSessionsHandler,
    private readonly revokeSessionHandler: RevokeSessionHandler,
    private readonly logoutAllHandler: LogoutAllHandler,

    // 🔥 NEW
    private readonly requestResetHandler: RequestPasswordResetHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
  ) {}

  // =====================
  // 🟢 REGISTER
  // =====================
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const command = new RegisterUserCommand(
      dto.name,
      dto.email,
      dto.password,
      dto.phone,
      req.ip,
      this.getUserAgent(req),
    );

    const result = await this.registerHandler.execute(command);

    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  // =====================
  // 🟢 LOGIN
  // =====================
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const command = new LoginUserCommand(
      dto.identifier,
      dto.password,
      this.getUserAgent(req),
      req.ip,
    );

    const result = await this.loginHandler.execute(command);

    return {
      message: 'Login successful',
      data: result,
    };
  }

  // =====================
  // 🔥 REFRESH TOKEN
  // =====================
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const command = new RefreshTokenCommand(
      dto.refreshToken,
      req.ip,
      this.getUserAgent(req),
    );

    const result = await this.refreshHandler.execute(command);

    return {
      message: 'Token refreshed',
      data: result,
    };
  }

  // =====================
  // 🔐 LOGOUT (CURRENT)
  // =====================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: AuthUser, @Req() req: Request) {
    await this.logoutHandler.execute(
      new LogoutCommand(
        user.sessionId,
        user.sub, // 🔥 FIXED (ownership check requires userId)
        req.ip,
        this.getUserAgent(req),
      ),
    );

    return {
      message: 'Logged out successfully',
    };
  }

  // =====================
  // 📱 LIST SESSIONS
  // =====================
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async listSessions(@CurrentUser() user: AuthUser) {
    const result = await this.listSessionsHandler.execute(
      new ListSessionsQuery(user.sub),
      user.sessionId,
    );

    return {
      message: 'Sessions fetched',
      data: result,
    };
  }

  // =====================
  // 🔐 REVOKE SESSION
  // =====================
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/revoke')
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    await this.revokeSessionHandler.execute(
      new RevokeSessionCommand(
        user.sub,
        sessionId,
        req.ip,
        this.getUserAgent(req),
      ),
    );

    return {
      message: 'Session revoked successfully',
    };
  }

  // =====================
  // 🔥 LOGOUT ALL
  // =====================
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@CurrentUser() user: AuthUser, @Req() req: Request) {
    await this.logoutAllHandler.execute(
      new LogoutAllCommand(
        user.sub,
        req.ip,
        this.getUserAgent(req),
      ),
    );

    return {
      message: 'Logged out from all devices',
    };
  }

  // =====================
  // 🔥 REQUEST RESET (OTP)
  // =====================
  @Post('password-reset/request')
  async requestReset(@Body() body: { email: string }, @Req() req: Request) {
    const result = await this.requestResetHandler.execute(
      new RequestPasswordResetCommand(
        body.email,
        req.ip,
        this.getUserAgent(req),
      ),
    );

    return {
      message: result.message,
    };
  }

  // =====================
  // 🔥 RESET PASSWORD
  // =====================
  @Post('password-reset/confirm')
  async resetPassword(
    @Body()
    body: { email: string; otp: string; newPassword: string },
    @Req() req: Request,
  ) {
    const result = await this.resetPasswordHandler.execute(
      new ResetPasswordCommand(
        body.email,
        body.otp,
        body.newPassword,
        req.ip,
        this.getUserAgent(req),
      ),
    );

    return {
      message: result.message,
    };
  }

  // =====================
  // 🔧 HELPER
  // =====================
  private getUserAgent(req: Request): string {
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) return ua.join(' ');
    return ua ?? 'unknown';
  }
}