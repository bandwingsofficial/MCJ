"use client";



import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Copy, Gift, Share2 } from "lucide-react";

import { toast } from "sonner";



import { Button } from "@/src/shared/components/ui/button";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { referralRewardsQueryKeys } from "@/src/features/referral-rewards/constants/query-keys";

import { RedeemCoinsModal } from "@/src/features/referral-rewards/components/redeem-coins-modal";

import { useReferralRewardsSummary } from "@/src/features/referral-rewards/hooks/use-referral-rewards-summary";

import {

  referralRewardsService,

  type CoinTransactionItem,
  type PublicReferralSettings,
  type RedemptionHistoryItem,
} from "@/src/features/referral-rewards/services/referral-rewards.service";

import {

  buildReferralRegisterPath,

  buildReferralRegisterUrl,

  buildReferralShareText,

  formatInrFromPaise,

  formatReferralCoins,

  formatReferralDateTime,

  formatStatusLabel,

  formatTransactionTypeLabel,

} from "@/src/features/referral-rewards/utils/referral-rewards-format.utils";



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

          : "bg-stone-100 text-stone-600 ring-stone-200";



  return (

    <span

      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}

    >

      {formatStatusLabel(status)}

    </span>

  );

}



function transactionReference(tx: CoinTransactionItem) {

  if (tx.referral?.referred?.name) {

    return tx.referral.referred.name;

  }

  if (tx.redemption?.publicId) {

    return tx.redemption.publicId;

  }

  return null;

}



export function MyRewardsPage() {

  const queryClient = useQueryClient();

  const [redeemOpen, setRedeemOpen] = useState(false);



  const summaryQuery = useReferralRewardsSummary();



  const settingsQuery = useQuery({
    queryKey: referralRewardsQueryKeys.settings,
    queryFn: (): Promise<PublicReferralSettings> =>
      referralRewardsService.getPublicSettings(),
  });

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



  const redeemMutation = useMutation({

    mutationFn: (coins: number) => referralRewardsService.createRedemption(coins),

    onSuccess: () => {

      toast.success("Redemption request submitted");

      setRedeemOpen(false);

      void queryClient.invalidateQueries({ queryKey: referralRewardsQueryKeys.root });

    },

    onError: (error: { response?: { data?: { message?: string } } }) => {

      toast.error(error.response?.data?.message ?? "Redemption failed");

    },

  });



  const referralCode = summaryQuery.data?.referralCode ?? null;

  const referralPath = referralCode ? buildReferralRegisterPath(referralCode) : "";

  const referralLink = useMemo(

    () => (referralCode ? buildReferralRegisterUrl(referralCode) : ""),

    [referralCode],

  );



  const wallet = summaryQuery.data?.wallet;

  const settings = settingsQuery.data;



  if (summaryQuery.isLoading) {

    return (

      <div className="space-y-4">

        <Skeleton className="h-10 w-64" />

        <Skeleton className="h-40 w-full rounded-2xl" />

      </div>

    );

  }



  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[26px]">

          Referral & Rewards

        </h1>

        <p className="mt-1 text-sm text-stone-500 sm:text-base">

          Earn coins by referring new users and manage your rewards.

        </p>

      </div>



      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard label="Available Coins" value={wallet?.availableCoins ?? 0} />

        <StatCard label="Locked Coins" value={wallet?.lockedCoins ?? 0} />

        <StatCard label="Total Earned" value={wallet?.totalEarned ?? 0} />

        <StatCard label="Total Redeemed" value={wallet?.totalRedeemed ?? 0} />

      </div>



      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div className="min-w-0 flex-1">

            <h2 className="text-lg font-semibold text-stone-900">Your Referral Code</h2>

            <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-amber-700">

              {referralCode ?? "—"}

            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">

              Referral Link

            </p>

            <p className="mt-1 break-all text-sm text-stone-600">

              {referralPath || "—"}

            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Button

              type="button"

              variant="outline"

              className="rounded-xl"

              disabled={!referralCode}

              onClick={async () => {

                if (!referralCode) return;

                await navigator.clipboard.writeText(referralCode);

                toast.success("Referral code copied");

              }}

            >

              <Copy className="mr-2 h-4 w-4" />

              Copy Code

            </Button>

            <Button

              type="button"

              className="rounded-xl bg-amber-500 hover:bg-amber-600"

              disabled={!referralLink}

              onClick={async () => {

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

                  /* user cancelled share */

                }

                await navigator.clipboard.writeText(text);

                toast.success("Referral link copied");

              }}

            >

              <Share2 className="mr-2 h-4 w-4" />

              Share

            </Button>

          </div>

        </div>



        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <MiniStat

            label="Total Referrals"

            value={summaryQuery.data?.stats.totalReferrals ?? 0}

          />

          <MiniStat

            label="Successful Referrals"

            value={summaryQuery.data?.stats.successfulReferrals ?? 0}

          />

          <MiniStat

            label="Pending Referrals"

            value={summaryQuery.data?.stats.pendingReferrals ?? 0}

          />

          <MiniStat

            label="Coins Earned From Referrals"

            value={summaryQuery.data?.stats.coinsEarnedFromReferrals ?? 0}

          />

        </div>

      </section>



      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold text-stone-900">My Referrals</h2>

        {!summaryQuery.data?.referrals.length ? (

          <p className="text-sm text-stone-500">No referrals yet</p>

        ) : (

          <ul className="divide-y divide-stone-100">

            {summaryQuery.data.referrals.map((item) => (

              <li

                key={item.id}

                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"

              >

                <div className="min-w-0">

                  <p className="font-medium text-stone-900">{item.referred.name}</p>

                  <p className="truncate text-stone-500">{item.referred.email}</p>

                </div>

                <div className="flex flex-col items-end gap-1 text-right">

                  <StatusBadge status={item.status} />

                  {item.status === "REWARDED" ? (

                    <p className="font-semibold text-emerald-700">

                      +{item.rewardCoins} Coins

                    </p>

                  ) : null}

                  <p className="text-stone-500">{formatReferralDateTime(item.createdAt)}</p>

                </div>

              </li>

            ))}

          </ul>

        )}

      </section>



      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold text-stone-900">Coin History</h2>

        {txQuery.isLoading ? (

          <Skeleton className="h-24 w-full rounded-xl" />

        ) : !txQuery.data?.items.length ? (

          <p className="text-sm text-stone-500">No coin transactions yet</p>

        ) : (

          <ul className="divide-y divide-stone-100">

            {txQuery.data.items.map((tx) => {

              const reference = transactionReference(tx);

              return (

                <li

                  key={tx.id}

                  className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm"

                >

                  <div className="min-w-0">

                    <p className="font-semibold text-stone-900">

                      {formatReferralCoins(tx.amount, tx.direction)}

                    </p>

                    <p className="text-stone-700">

                      {tx.description ?? formatTransactionTypeLabel(tx.type)}

                    </p>

                    {reference ? (

                      <p className="text-stone-500">{reference}</p>

                    ) : tx.publicId ? (

                      <p className="font-mono text-xs text-stone-400">{tx.publicId}</p>

                    ) : null}

                  </div>

                  <div className="text-right text-stone-500">

                    <p>{formatReferralDateTime(tx.createdAt)}</p>

                    <p className="text-xs text-stone-400">

                      Balance: {tx.availableAfter}

                    </p>

                  </div>

                </li>

              );

            })}

          </ul>

        )}

      </section>



      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold text-stone-900">Redemption History</h2>

        {redemptionsQuery.isLoading ? (

          <Skeleton className="h-24 w-full rounded-xl" />

        ) : !redemptionsQuery.data?.length ? (

          <p className="text-sm text-stone-500">No redemption requests yet</p>

        ) : (

          <ul className="divide-y divide-stone-100">

            {redemptionsQuery.data.map((item) => (

              <li

                key={item.id}

                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"

              >

                <div>

                  <p className="font-mono font-medium text-stone-900">{item.publicId}</p>

                  <p className="text-stone-600">

                    {item.coins} Coins · {formatInrFromPaise(item.moneyValuePaise)}

                  </p>

                </div>

                <div className="flex flex-col items-end gap-1 text-right">

                  <StatusBadge status={item.status} />

                  <p className="text-stone-500">

                    {formatReferralDateTime(item.requestedAt)}

                  </p>

                  {item.processedAt ? (

                    <p className="text-xs text-stone-400">

                      Processed {formatReferralDateTime(item.processedAt)}

                    </p>

                  ) : null}

                </div>

              </li>

            ))}

          </ul>

        )}

      </section>



      <section className="rounded-2xl border border-stone-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-2">

          <Gift className="h-5 w-5 text-amber-600" />

          <h2 className="text-lg font-semibold text-stone-900">Redeem Coins</h2>

        </div>

        {settings ? (

          <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">

            <div>

              <dt className="text-stone-500">Available Coins</dt>

              <dd className="font-semibold tabular-nums text-stone-900">

                {wallet?.availableCoins ?? 0}

              </dd>

            </div>

            <div>

              <dt className="text-stone-500">Conversion Rate</dt>

              <dd className="font-medium text-stone-900">

                {settings.coinsPerRupee} Coins = ₹1

              </dd>

            </div>

            <div>

              <dt className="text-stone-500">Minimum Redemption</dt>

              <dd className="font-medium text-stone-900">

                {settings.minRedemptionCoins} coins

              </dd>

            </div>

            {settings.maxRedemptionCoins != null ? (

              <div>

                <dt className="text-stone-500">Maximum Redemption</dt>

                <dd className="font-medium text-stone-900">

                  {settings.maxRedemptionCoins} coins

                </dd>

              </div>

            ) : null}

          </dl>

        ) : null}

        <Button

          type="button"

          className="rounded-xl bg-amber-500 hover:bg-amber-600"

          disabled={!settings?.redemptionEnabled || (wallet?.availableCoins ?? 0) < 1}

          onClick={() => setRedeemOpen(true)}

        >

          Redeem Coins

        </Button>

      </section>



      <RedeemCoinsModal

        open={redeemOpen}

        onClose={() => setRedeemOpen(false)}

        settings={settings}

        availableCoins={wallet?.availableCoins ?? 0}

        saving={redeemMutation.isPending}

        onSubmit={(coins) => redeemMutation.mutate(coins)}

      />

    </div>

  );

}



function StatCard({ label, value }: { label: string; value: number }) {

  return (

    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">

        {label}

      </p>

      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">{value}</p>

    </div>

  );

}



function MiniStat({ label, value }: { label: string; value: number }) {

  return (

    <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">

      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">

        {label}

      </p>

      <p className="text-lg font-bold tabular-nums text-stone-900">{value}</p>

    </div>

  );

}

