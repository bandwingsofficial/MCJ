import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';

import {
  CurrentUser,
  type AuthUser,
} from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { UserAccountLifecycleService } from '../application/user-account-lifecycle.service';

class SelfDeleteAccountDto {
  @IsString()
  @MinLength(1)
  confirmation!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('account')
@UseGuards(JwtAuthGuard)
export class CustomerAccountController {
  constructor(private readonly lifecycle: UserAccountLifecycleService) {}

  @Post('delete-permanently')
  async deletePermanently(
    @CurrentUser() user: AuthUser,
    @Body() body: SelfDeleteAccountDto,
  ) {
    if (body.confirmation.trim().toUpperCase() !== 'DELETE') {
      throw new BadRequestException('Confirmation must be DELETE');
    }

    return {
      data: await this.lifecycle.permanentlyDeleteUser({
        userId: user.sub,
        actorUserId: user.sub,
        reason: body.reason,
        source: 'SELF',
      }),
    };
  }
}
