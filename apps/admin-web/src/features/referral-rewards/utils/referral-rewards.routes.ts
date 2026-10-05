import type { ReferralRewardsTab } from "@/src/features/referral-rewards/components/referral-rewards-nav-tabs";

const TAB_TO_SLUG: Record<ReferralRewardsTab, string> = {
  Settings: "settings",
  Referrals: "referrals",
  Redemptions: "redemptions",
  "Referral Users": "referral-users",
  "Coin Transactions": "coin-transactions",
};

const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_SLUG).map(([tab, slug]) => [slug, tab]),
) as Record<string, ReferralRewardsTab>;

export const REFERRAL_REWARDS_DEFAULT_TAB: ReferralRewardsTab = "Settings";

export function referralRewardsTabSlug(tab: ReferralRewardsTab): string {
  return TAB_TO_SLUG[tab];
}

export function isReferralRewardsTabSlug(
  value: string | null | undefined,
): value is string {
  return Boolean(value && value in SLUG_TO_TAB);
}

export function resolveReferralRewardsTab(
  tabParam: string | null | undefined,
): ReferralRewardsTab {
  if (tabParam && tabParam in SLUG_TO_TAB) {
    return SLUG_TO_TAB[tabParam];
  }
  return REFERRAL_REWARDS_DEFAULT_TAB;
}

export function referralRewardsPagePath(tab: ReferralRewardsTab = REFERRAL_REWARDS_DEFAULT_TAB): string {
  return `/referral-rewards?tab=${referralRewardsTabSlug(tab)}`;
}
