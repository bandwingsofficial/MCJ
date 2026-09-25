export type ReferralSettingsRecord = {
  id: string;
  name: string;
  isActive: boolean;
  referralEnabled: boolean;
  rewardCoinsPerReferral: number;
  qualificationCondition: string;
  referralExpiryDays: number | null;
  maxReferralsPerReferrer: number | null;
  redemptionEnabled: boolean;
  coinsPerRupee: number;
  minRedemptionCoins: number;
  maxRedemptionCoins: number | null;
  updatedAt?: string;
};

export function getConfigurationDisplayName(id: string): string {
  if (id === "default") {
    return "Default Rewards";
  }
  return id;
}

export function formatQualificationLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatRedemptionSummary(settings: ReferralSettingsRecord): string {
  if (!settings.redemptionEnabled) {
    return "Disabled";
  }
  return `${settings.coinsPerRupee} coins = ₹1`;
}

export function formatConfigurationStatus(settings: ReferralSettingsRecord): string {
  return settings.isActive ? "Active" : "Inactive";
}

export function formatReferralStatusLabel(enabled: boolean): string {
  return enabled ? "Enabled" : "Disabled";
}
