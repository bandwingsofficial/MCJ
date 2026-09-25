import { Controller, Get } from '@nestjs/common';

import { ReferralSettingsService } from '../../application/referral-settings.service';

@Controller('referral-rewards')
export class PublicReferralRewardsController {
  constructor(private readonly settingsService: ReferralSettingsService) {}

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
