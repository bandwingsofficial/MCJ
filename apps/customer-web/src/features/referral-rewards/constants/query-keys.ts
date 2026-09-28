export const referralRewardsQueryKeys = {
  root: ["referral-rewards"] as const,
  me: ["referral-rewards", "me"] as const,
  settings: ["referral-rewards", "settings"] as const,
  publicSettings: ["referral-rewards", "settings", "public"] as const,
  transactions: (direction?: string) =>
    ["referral-rewards", "transactions", direction ?? "ALL"] as const,
  redemptions: ["referral-rewards", "redemptions"] as const,
};
