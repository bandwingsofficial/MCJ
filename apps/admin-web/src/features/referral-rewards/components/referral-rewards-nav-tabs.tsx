"use client";

import { cn } from "@/src/shared/lib/cn";

export const REFERRAL_REWARDS_TABS = [
  "Settings",
  "Referrals",
  "Redemptions",
  "Referral Users",
  "Coin Transactions",
] as const;

export type ReferralRewardsTab = (typeof REFERRAL_REWARDS_TABS)[number];

interface ReferralRewardsNavTabsProps {
  value: ReferralRewardsTab;
  onChange: (tab: ReferralRewardsTab) => void;
  disabled?: boolean;
}

export function ReferralRewardsNavTabs({
  value,
  onChange,
  disabled,
}: ReferralRewardsNavTabsProps) {
  return (
    <div
      className="flex h-auto w-full flex-wrap justify-start gap-0.5 border-b border-slate-200"
      role="tablist"
      aria-label="Referral and rewards sections"
    >
      {REFERRAL_REWARDS_TABS.map((tab) => {
        const isActive = value === tab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={cn(
              "rounded-none border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-[#102A56]",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
