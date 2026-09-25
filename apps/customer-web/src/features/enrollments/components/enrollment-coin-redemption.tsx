"use client";

import { useEffect, useMemo, useState } from "react";
import { Coins, Sparkles } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { formatCurrency } from "@/src/features/batches/utils/batch-pricing.utils";

export interface EnrollmentCoinRedemptionConfig {
  availableCoins: number;
  coinsPerRupee: number;
  minRedemptionCoins: number;
  maxRedemptionCoins: number | null;
  redemptionEnabled: boolean;
}

interface EnrollmentCoinRedemptionProps {
  config: EnrollmentCoinRedemptionConfig | null;
  currency: string;
  maxCoinDiscountRupees: number;
  appliedCoins: number;
  appliedDiscount: number;
  onApply: (coins: number) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
  disabled?: boolean;
}

function rupeesFromCoins(coins: number, coinsPerRupee: number): number {
  if (coinsPerRupee <= 0) {
    return 0;
  }
  return Math.round((coins / coinsPerRupee) * 100) / 100;
}

export function EnrollmentCoinRedemption({
  config,
  currency,
  maxCoinDiscountRupees,
  appliedCoins,
  appliedDiscount,
  onApply,
  onRemove,
  disabled = false,
}: EnrollmentCoinRedemptionProps) {
  const [coinsInput, setCoinsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (appliedCoins <= 0) {
      setCoinsInput("");
    }
  }, [appliedCoins]);

  const conversionLabel = useMemo(() => {
    if (!config || config.coinsPerRupee <= 0) {
      return "—";
    }
    const rupeesPerCoin = 1 / config.coinsPerRupee;
    return `1 Coin = ${formatCurrency(rupeesPerCoin, currency)}`;
  }, [config, currency]);

  if (!config?.redemptionEnabled) {
    return null;
  }

  const handleApply = async () => {
    setError(null);
    const coins = Number.parseInt(coinsInput, 10);
    if (!Number.isFinite(coins) || coins <= 0) {
      setError("Enter a valid coin amount");
      return;
    }

    if (coins < config.minRedemptionCoins) {
      setError(`Minimum redemption is ${config.minRedemptionCoins} coins`);
      return;
    }

    if (config.maxRedemptionCoins != null && coins > config.maxRedemptionCoins) {
      setError(`Maximum redemption is ${config.maxRedemptionCoins} coins`);
      return;
    }

    if (coins > config.availableCoins) {
      setError("Insufficient available coins");
      return;
    }

    const discount = rupeesFromCoins(coins, config.coinsPerRupee);
    if (discount > maxCoinDiscountRupees) {
      setError("Coin discount exceeds the course fee for this enrollment");
      return;
    }

    try {
      setIsApplying(true);
      await onApply(coins);
      setCoinsInput(String(coins));
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Unable to apply coins",
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-[#1E49A8] via-[#2563EB] to-[#2F6BE5] p-5 text-white shadow-md sm:p-6">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/5"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Rewards Wallet
        </div>

        <div className="space-y-1.5 text-sm text-blue-100/95">
          <p className="flex flex-wrap items-baseline gap-1">
            <span>Available:</span>
            <span className="text-base font-bold text-white">
              {config.availableCoins.toLocaleString()} Coins
            </span>
          </p>
          <p>
            <span className="text-blue-100/90">Conversion:</span>{" "}
            <span className="font-medium text-white">{conversionLabel}</span>
          </p>
          <p>
            <span className="text-blue-100/90">Minimum:</span>{" "}
            <span className="font-medium text-white">
              {config.minRedemptionCoins.toLocaleString()} Coins
            </span>
          </p>
          {config.maxRedemptionCoins != null ? (
            <p>
              <span className="text-blue-100/90">Maximum:</span>{" "}
              <span className="font-medium text-white">
                {config.maxRedemptionCoins.toLocaleString()} Coins
              </span>
            </p>
          ) : null}
        </div>

        {appliedCoins > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              <p className="text-sm font-medium text-white">
                Applied: {appliedCoins.toLocaleString()} coins (
                {formatCurrency(appliedDiscount, currency)} discount)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 border-white/30 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/20 hover:text-white"
              disabled={disabled || isRemoving}
              loading={isRemoving}
              onClick={() => {
                void (async () => {
                  setError(null);
                  try {
                    setIsRemoving(true);
                    await onRemove();
                  } catch (removeError) {
                    setError(
                      removeError instanceof Error
                        ? removeError.message
                        : "Unable to remove applied coins",
                    );
                  } finally {
                    setIsRemoving(false);
                  }
                })();
              }}
            >
              Remove
            </Button>
          </div>
        ) : null}
        {appliedCoins > 0 && error ? (
          <p role="alert" className="mt-2 text-sm font-medium text-red-200">
            {error}
          </p>
        ) : null}
        {appliedCoins <= 0 ? (
          <div className="mt-5 border-t border-white/15 pt-4">
            <label
              htmlFor="enrollment-coins-to-redeem"
              className="text-[11px] font-semibold uppercase tracking-wider text-blue-100"
            >
              Coins to Redeem
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="enrollment-coins-to-redeem"
                type="number"
                min={1}
                placeholder="Enter coins to redeem"
                value={coinsInput}
                onChange={(event) => setCoinsInput(event.target.value)}
                className="h-11 flex-1 border-white/20 bg-white/95 text-slate-900 placeholder:text-slate-400 sm:min-w-0"
                disabled={disabled || isApplying}
              />
              <Button
                type="button"
                className="h-11 shrink-0 border-0 bg-white px-6 font-semibold text-[#1E49A8] hover:bg-blue-50 sm:w-auto sm:min-w-[6.5rem]"
                disabled={disabled || isApplying}
                loading={isApplying}
                onClick={() => void handleApply()}
              >
                Apply
              </Button>
            </div>
            {coinsInput ? (
              <p className="mt-2 text-xs text-blue-100/90">
                Discount preview:{" "}
                <span className="font-semibold text-emerald-200">
                  {formatCurrency(
                    rupeesFromCoins(
                      Number.parseInt(coinsInput, 10) || 0,
                      config.coinsPerRupee,
                    ),
                    currency,
                  )}
                </span>
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-2 text-sm font-medium text-red-200">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
