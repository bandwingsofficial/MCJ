import { Controller, Get, Query } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

import { ReferralRegistrationService } from '../../application/referral-registration.service';
import { ReferralSettingsService } from '../../application/referral-settings.service';

class ValidateRegistrationReferralQueryDto {
  @IsString()
  @Matches(/^[A-Za-z0-9]{6,12}$/)
  code!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Controller('referral-rewards')
export class PublicReferralRewardsController {
  constructor(
    private readonly settingsService: ReferralSettingsService,
    private readonly referralRegistration: ReferralRegistrationService,
  ) {}

  @Get('validate-registration-code')
  async validateRegistrationCode(
    @Query() query: ValidateRegistrationReferralQueryDto,
  ) {
    const result =
      await this.referralRegistration.previewReferralCodeForRegistration(
        query.code,
        query.email?.trim() || '',
      );

    return {
      message: result.valid ? 'Referral code is valid' : result.message,
      data: result,
    };
  }

  @Get('settings/public')
  async getPublicSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      data: {
        referralEnabled: settings.referralEnabled,
        redemptionEnabled: settings.redemptionEnabled,
        coinsPerRupee: settings.coinsPerRupee,
        minRedemptionCoins: settings.minRedemptionCoins,
        maxRedemptionCoins: settings.maxRedemptionCoins,
        rewardCoinsPerReferral: settings.rewardCoinsPerReferral,
      },
    };
  }
}
