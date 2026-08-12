// presentation/controllers/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import {
  CurrentUser,
  type AuthUser,
} from '../../../../common/decorators/current-user.decorator';

// =====================
// HANDLERS
// =====================

import { RegisterUserHandler } from '../../application/register/register-user.handler';
import { LoginUserHandler } from '../../application/login/login-user.handler';
import { RefreshTokenHandler } from '../../application/refresh/refresh-token.handler';

import { LogoutHandler } from '../../application/logout/logout.handler';

import { ListSessionsHandler } from '../../application/session/list-sessions.handler';

import { RevokeSessionHandler } from '../../application/session/revoke-session.handler';

import { LogoutAllHandler } from '../../application/session/logout-all.handler';

import { RequestPasswordResetHandler } from '../../application/password-reset/request-password-reset.handler';

import { ResetPasswordHandler } from '../../application/password-reset/reset-password.handler';

import { GetMeHandler } from '../../application/me/get-me.handler';

// =====================
// COMMANDS / QUERIES
// =====================

import { RegisterUserCommand } from '../../application/register/register-user.command';

import { LoginUserCommand } from '../../application/login/login-user.command';

import { RefreshTokenCommand } from '../../application/refresh/refresh-token.command';

import { LogoutCommand } from '../../application/logout/logout.command';

import { ListSessionsQuery } from '../../application/session/list-sessions.query';

import { RevokeSessionCommand } from '../../application/session/revoke-session.command';

import { LogoutAllCommand } from '../../application/session/logout-all.command';

import { RequestPasswordResetCommand } from '../../application/password-reset/request-password-reset.command';

import { ResetPasswordCommand } from '../../application/password-reset/reset-password.command';

// =====================
// COMMANDS / QUERIES
// =====================

import { GetMeQuery } from '../../application/me/get-me.query';

// =====================
// DTOs
// =====================

import { RegisterDto } from '../dtos/register.dto';

import { LoginDto } from '../dtos/login.dto';

import { RefreshTokenDto } from '../dtos/refresh-token.dto';

import { RequestPasswordResetDto } from '../dtos/request-password-reset.dto';

import { ResetPasswordDto } from '../dtos/reset-password.dto';

// =====================
// UTILS
// =====================

import {
  getClientIp,
  getUserAgent,
} from '../../application/utils/request.util';

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

    private readonly requestResetHandler: RequestPasswordResetHandler,

    private readonly resetPasswordHandler: ResetPasswordHandler,
    private readonly getMeHandler: GetMeHandler,
  ) {}

  // =====================
  // 🟢 REGISTER
  // =====================

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.registerHandler.execute(
      new RegisterUserCommand(
        dto.name,

        dto.email,

        dto.password,

        dto.phone,

        getClientIp(req),

        getUserAgent(req),
      ),
    );

    return {
      message: 'User registered successfully',

      data: result,
    };
  }

  // =====================
  // 🔐 LOGIN
  // =====================

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.loginHandler.execute(
      new LoginUserCommand(
        dto.identifier,

        dto.password,

        getUserAgent(req),

        getClientIp(req),
      ),
    );

    return {
      message: 'Login successful',

      data: result,
    };
  }

  // =====================
  // 🔄 REFRESH
  // =====================

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const result = await this.refreshHandler.execute(
      new RefreshTokenCommand(
        dto.refreshToken,

        getClientIp(req),

        getUserAgent(req),
      ),
    );

    return {
      message: 'Token refreshed',

      data: result,
    };
  }

  // =====================
  // 🚪 LOGOUT
  // =====================

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser()
    user: AuthUser,

    @Req()
    req: Request,
  ) {
    await this.logoutHandler.execute(
      new LogoutCommand(
        user.sub, // ✅ userId
        user.sessionId,

        getClientIp(req),

        getUserAgent(req),
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
  async listSessions(
    @CurrentUser()
    user: AuthUser,
  ) {
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
    @Param('id')
    sessionId: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    req: Request,
  ) {
    await this.revokeSessionHandler.execute(
      new RevokeSessionCommand(
        user.sub,

        sessionId,

        getClientIp(req),

        getUserAgent(req),
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
  async logoutAll(
    @CurrentUser()
    user: AuthUser,

    @Req()
    req: Request,
  ) {
    await this.logoutAllHandler.execute(
      new LogoutAllCommand(
        user.sub,

        getClientIp(req),

        getUserAgent(req),
      ),
    );

    return {
      message: 'Logged out from all devices',
    };
  }

  // =====================
  // 🔥 REQUEST RESET
  // =====================

  @Post('password-reset/request')
  async requestReset(
    @Body()
    dto: RequestPasswordResetDto,

    @Req()
    req: Request,
  ) {
    const result = await this.requestResetHandler.execute(
      new RequestPasswordResetCommand(
        dto.email,

        getClientIp(req),

        getUserAgent(req),
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
    dto: ResetPasswordDto,

    @Req()
    req: Request,
  ) {
    const result = await this.resetPasswordHandler.execute(
      new ResetPasswordCommand(
        dto.email,

        dto.otp,

        dto.newPassword,

        getClientIp(req),

        getUserAgent(req),
      ),
    );

    return {
      message: result.message,
    };
  }

  // =====================
  // 👤 CURRENT USER
  // =====================

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @CurrentUser()
    user: AuthUser,
  ) {
    const result = await this.getMeHandler.execute(
      new GetMeQuery(user.sub, user.sessionId),
    );

    return {
      message: 'Profile fetched successfully',

      data: result,
    };
  }
}
