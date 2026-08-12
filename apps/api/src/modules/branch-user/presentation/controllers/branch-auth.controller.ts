import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { LoginBranchUserDto } from '../dtos/login-branch-user.dto';
import { RefreshBranchUserTokenDto } from '../dtos/refresh-branch-user-token.dto';

import { LoginBranchUserHandler } from '../../application/login-branch-user/login-branch-user.handler';
import { RefreshBranchUserTokenHandler } from '../../application/refresh-branch-user-token/refresh-branch-user-token.handler';
import { LogoutBranchUserHandler } from '../../application/logout-branch-user/logout-branch-user.handler';
import { GetBranchUserMeHandler } from '../../application/me/get-branch-user-me.handler';

import { LoginBranchUserCommand } from '../../application/login-branch-user/login-branch-user.command';
import { RefreshBranchUserTokenCommand } from '../../application/refresh-branch-user-token/refresh-branch-user-token.command';
import { LogoutBranchUserCommand } from '../../application/logout-branch-user/logout-branch-user.command';
import { GetBranchUserMeQuery } from '../../application/me/get-branch-user-me.query';

import { BranchJwtAuthGuard } from '@common/guards/branch-jwt-auth.guard';
import { CurrentBranchUser } from '@common/decorators/current-branch-user.decorator';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';

@Controller('branch-auth')
export class BranchAuthController {
  constructor(
    private readonly loginBranchUserHandler: LoginBranchUserHandler,
    private readonly refreshBranchUserTokenHandler: RefreshBranchUserTokenHandler,
    private readonly logoutBranchUserHandler: LogoutBranchUserHandler,
    private readonly getBranchUserMeHandler: GetBranchUserMeHandler,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginBranchUserDto,
  ) {
    const result =
      await this.loginBranchUserHandler.execute(
        new LoginBranchUserCommand(
          dto.identifier,
          dto.password,
        ),
      );

    return {
      message: 'Branch login successful',
      data: result,
    };
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshBranchUserTokenDto,
  ) {
    const result =
      await this.refreshBranchUserTokenHandler.execute(
        new RefreshBranchUserTokenCommand(
          dto.refreshToken,
        ),
      );

    return {
      message: 'Token refreshed',
      data: result,
    };
  }

  @UseGuards(BranchJwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentBranchUser()
    user: BranchAuthUser,
  ) {
    const result =
      await this.logoutBranchUserHandler.execute(
        new LogoutBranchUserCommand(user.sub),
      );

    return {
      message: result.message,
    };
  }

  @UseGuards(BranchJwtAuthGuard)
  @Get('me')
  async me(
    @CurrentBranchUser()
    user: BranchAuthUser,
  ) {
    const result =
      await this.getBranchUserMeHandler.execute(
        new GetBranchUserMeQuery(user.sub),
      );

    return {
      message:
        'Branch user profile fetched successfully',
      data: result,
    };
  }
}
