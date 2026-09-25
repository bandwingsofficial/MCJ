"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Gift,
  Link2,
  Lock,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";
import { referralRewardsQueryKeys } from "@/src/features/referral-rewards/constants/query-keys";
import { useReferralRewardsSummary } from "@/src/features/referral-rewards/hooks/use-referral-rewards-summary";
import {
  referralRewardsService,
  type CoinTransactionItem,
  type RedemptionHistoryItem,
} from "@/src/features/referral-rewards/services/referral-rewards.service";
import {
  buildReferralRegisterUrl,
  buildReferralShareText,
  formatInrFromPaise,
  formatReferralCoins,
  formatReferralDateTime,
  formatStatusLabel,
  formatTransactionTypeLabel,
} from "@/src/features/referral-rewards/utils/referral-rewards-format.utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const styles =
    normalized === "REWARDED" || normalized === "PROCESSED" || normalized === "APPROVED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : normalized === "PENDING" || normalized === "QUALIFIED"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : normalized === "REJECTED" ||
            normalized === "EXPIRED" ||
            normalized === "CANCELLED"
          ? "bg-red-50 text-red-700 ring-red-100"
          : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        styles,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

function transactionReference(tx: CoinTransactionItem) {
  if (tx.referral?.referred?.name) return tx.referral.referred.name;
  if (tx.redemption?.publicId) return tx.redemption.publicId;
  return null;
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold tracking-tight text-[#0B1F3A]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
      <div className="mb-2 text-slate-400">{icon}</div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function MyRewardsPage() {
  const summaryQuery = useReferralRewardsSummary();

  const txQuery = useQuery({
    queryKey: referralRewardsQueryKeys.transactions("ALL"),
    queryFn: () =>
      referralRewardsService.listTransactions({ take: 100 }) as Promise<{
        items: CoinTransactionItem[];
        total: number;
      }>,
  });

  const redemptionsQuery = useQuery({
    queryKey: referralRewardsQueryKeys.redemptions,
    queryFn: (): Promise<RedemptionHistoryItem[]> =>
      referralRewardsService.listRedemptions(),
  });

  const referralCode = summaryQuery.data?.referralCode ?? null;
  const referralLink = useMemo(
    () => (referralCode ? buildReferralRegisterUrl(referralCode) : ""),
    [referralCode],
  );

  const wallet = summaryQuery.data?.wallet;
  const stats = summaryQuery.data?.stats;

  const copyCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied");
  };

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  const shareReferral = async () => {
    if (!referralLink) return;
    const text = buildReferralShareText(referralLink);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join MCJ Academy",
          text,
          url: referralLink,
        });
        return;
      }
    } catch {
      /* cancelled */
    }
    await navigator.clipboard.writeText(text);
    toast.success("Referral link copied");
  };

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="relative overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-[#1E49A8] via-[#2563EB] to-[#2F6BE5] p-5 text-white shadow-md sm:p-6">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/5"
          aria-hidden
        />
        <div className="relative space-y-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs text-blue-100/90"
          >
            <Link
              href="/"
              className="transition-colors hover:text-white"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="text-blue-100/75">Student</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            <span aria-current="page" className="font-medium text-white">
              Referral & Rewards
            </span>
          </nav>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              <Gift className="h-3.5 w-3.5" aria-hidden />
              Rewards
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
              Referral & Rewards
            </h1>
            <p className="mt-1 max-w-xl text-sm text-blue-100/95 sm:text-[15px]">
              Earn coins by sharing MCJ Academy with your friends.
            </p>
          </div>

          <div className="border-t border-white/15 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
            Your Referral Code
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] sm:text-4xl">
            {referralCode ?? "—"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg border-0 bg-white/95 text-[#0B1F3A] hover:bg-white"
              disabled={!referralCode}
              onClick={() => void copyCode()}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <Button
              type="button"
              className="rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20"
              disabled={!referralLink}
              onClick={() => void shareReferral()}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="mt-5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
              Referral link
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 py-1.5 pl-3 pr-1.5">
              <Link2 className="h-4 w-4 shrink-0 text-blue-100" aria-hidden />
              <p className="min-w-0 flex-1 truncate text-sm text-white/95">
                {referralLink || "—"}
              </p>
              <button
                type="button"
                disabled={!referralLink}
                onClick={() => void copyLink()}
                className="rounded-md p-2 text-white/90 transition hover:bg-white/15 disabled:opacity-40"
                aria-label="Copy referral link"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Wallet summary */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WalletMetricCard
          icon={Wallet}
          iconClass="text-[#2563EB] bg-blue-50"
          label="Available Coins"
          value={wallet?.availableCoins ?? 0}
          hint="Ready to redeem"
        />
        <WalletMetricCard
          icon={TrendingUp}
          iconClass="text-emerald-600 bg-emerald-50"
          label="Total Earned"
          value={wallet?.totalEarned ?? 0}
          hint="Lifetime credits"
        />
        <WalletMetricCard
          icon={Coins}
          iconClass="text-indigo-600 bg-indigo-50"
          label="Total Redeemed"
          value={wallet?.totalRedeemed ?? 0}
          hint="Successfully redeemed"
        />
        <WalletMetricCard
          icon={Lock}
          iconClass="text-amber-700 bg-amber-50"
          label="Locked Coins"
          value={wallet?.lockedCoins ?? 0}
          hint={
            (wallet?.lockedCoins ?? 0) > 0
              ? "Pending redemption"
              : "None locked"
          }
        />
      </div>

      {/* Referral stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={Users} label="Total Referrals" value={stats?.totalReferrals ?? 0} />
        <StatChip
          icon={CheckCircle2}
          label="Successful Referrals"
          value={stats?.successfulReferrals ?? 0}
        />
        <StatChip icon={Clock} label="Pending Referrals" value={stats?.pendingReferrals ?? 0} />
        <StatChip
          icon={Gift}
          label="Referral Coins Earned"
          value={stats?.coinsEarnedFromReferrals ?? 0}
        />
      </div>

      {/* Two-column: referrals + redeem */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Panel title="My Referrals" className="lg:col-span-2">
          {!summaryQuery.data?.referrals.length ? (
            <EmptyState
              icon={<Gift className="h-8 w-8" />}
              title="No referrals yet"
              description="Share your referral code to start earning coins."
            />
          ) : (
            <ul className="space-y-2">
              {summaryQuery.data.referrals.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/40 p-3 transition hover:border-slate-200"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6BE5] to-[#1E49A8] text-xs font-bold text-white"
                    aria-hidden
                  >
                    {initialsFromName(item.referred.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#0B1F3A]">
                      {item.referred.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.referred.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <StatusBadge status={item.status} />
                    {item.status === "REWARDED" ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        +{item.rewardCoins} Coins
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      {formatReferralDateTime(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Coin Redemption" className="lg:col-span-1">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p className="font-medium text-[#0B1F3A]">
              Your coins are safely stored in your wallet.
            </p>
            <p>
              Coin redemption is currently handled through the MCJ Academy rewards
              process. You can continue to view your available coins, earned coins,
              transactions, and redemption history here.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Coin History">
        {txQuery.isLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : !txQuery.data?.items.length ? (
          <EmptyState title="No coin transactions yet" icon={<Coins className="h-7 w-7" />} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {txQuery.data.items.map((tx) => {
              const isCredit = tx.direction === "CREDIT";
              const reference = transactionReference(tx);
              return (
                <li
                  key={tx.id}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
                      )}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0B1F3A]">
                        {tx.description ?? formatTransactionTypeLabel(tx.type)}
                      </p>
                      {reference ? (
                        <p className="truncate text-xs text-slate-500">{reference}</p>
                      ) : tx.publicId ? (
                        <p className="font-mono text-xs text-slate-400">{tx.publicId}</p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                        {formatReferralDateTime(tx.createdAt)} · Bal{" "}
                        {tx.availableAfter}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        isCredit ? "text-emerald-700" : "text-red-700",
                      )}
                    >
                      {formatReferralCoins(tx.amount, tx.direction)}
                    </p>
                    <p className="hidden text-xs text-slate-400 sm:block">
                      {formatReferralDateTime(tx.createdAt)}
                    </p>
                    <p className="hidden text-[11px] text-slate-400 sm:block">
                      Balance {tx.availableAfter}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Redemption History">
        {redemptionsQuery.isLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : !redemptionsQuery.data?.length ? (
          <EmptyState
            title="No redemption requests yet"
            icon={<Wallet className="h-7 w-7" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-3 font-semibold">Request</th>
                  <th className="pb-2 pr-3 font-semibold">Coins</th>
                  <th className="pb-2 pr-3 font-semibold">Value</th>
                  <th className="pb-2 pr-3 font-semibold">Status</th>
                  <th className="pb-2 pr-3 font-semibold">Requested</th>
                  <th className="pb-2 font-semibold">Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {redemptionsQuery.data.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-2.5 pr-3 font-mono text-xs font-medium text-[#0B1F3A]">
                      {item.publicId}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">{item.coins}</td>
                    <td className="py-2.5 pr-3">
                      {formatInrFromPaise(item.moneyValuePaise)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500">
                      {formatReferralDateTime(item.requestedAt)}
                    </td>
                    <td className="py-2.5 text-xs text-slate-500">
                      {item.processedAt
                        ? formatReferralDateTime(item.processedAt)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function WalletMetricCard({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet;
  iconClass: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className={cn("mb-3 inline-flex rounded-lg p-2", iconClass)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[#0B1F3A]">
        {value.toLocaleString("en-IN")}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="rounded-lg bg-slate-50 p-2 text-slate-500">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums text-[#0B1F3A]">
          {value.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
