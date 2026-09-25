"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import type { PublicReferralSettings } from "@/src/features/referral-rewards/services/referral-rewards.service";
import { formatInrFromPaise } from "@/src/features/referral-rewards/utils/referral-rewards-format.utils";

interface RedeemCoinsModalProps {
  open: boolean;
  onClose: () => void;
  settings: PublicReferralSettings | undefined;
  availableCoins: number;
  saving?: boolean;
  onSubmit: (coins: number) => void;
}

export function RedeemCoinsModal({
  open,
  onClose,
  settings,
  availableCoins,
  saving = false,
  onSubmit,
}: RedeemCoinsModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setError(null);
    }
  }, [open]);

  const coins = Number(amount) || 0;
  const moneyPreview = useMemo(() => {
    if (!settings || coins <= 0) return formatInrFromPaise(0);
    return formatInrFromPaise(Math.floor((coins / settings.coinsPerRupee) * 100));
  }, [coins, settings]);

  const handleSubmit = () => {
    if (!settings?.redemptionEnabled) {
      setError("Redemption is currently disabled.");
      return;
    }
    if (coins < settings.minRedemptionCoins) {
      setError(`Minimum redemption is ${settings.minRedemptionCoins} coins.`);
      return;
    }
    if (
      settings.maxRedemptionCoins != null &&
      coins > settings.maxRedemptionCoins
    ) {
      setError(`Maximum redemption is ${settings.maxRedemptionCoins} coins.`);
      return;
    }
    if (coins > availableCoins) {
      setError("Amount exceeds your available coins.");
      return;
    }
    setError(null);
    onSubmit(coins);
  };

  return (
    <Modal open={open} title="Redeem Coins" onClose={onClose} layout="scrollable">
      <div className="space-y-4 p-6 pt-0">
        {settings ? (
          <dl className="grid gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">Available Coins</dt>
              <dd className="font-semibold tabular-nums text-stone-900">
                {availableCoins}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">Conversion Rate</dt>
              <dd className="font-medium text-stone-900">
                {settings.coinsPerRupee} Coins = ₹1
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">Minimum Redemption</dt>
              <dd className="font-medium text-stone-900">
                {settings.minRedemptionCoins} coins
              </dd>
            </div>
            {settings.maxRedemptionCoins != null ? (
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500">Maximum Redemption</dt>
                <dd className="font-medium text-stone-900">
                  {settings.maxRedemptionCoins} coins
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Coins to redeem
          </label>
          <Input
            type="number"
            min={settings?.minRedemptionCoins ?? 1}
            max={settings?.maxRedemptionCoins ?? undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-xl"
            placeholder={String(settings?.minRedemptionCoins ?? 500)}
          />
          <p className="mt-1 text-sm text-stone-600">Value: {moneyPreview}</p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-amber-500 hover:bg-amber-600"
            loading={saving}
            disabled={!settings?.redemptionEnabled}
            onClick={handleSubmit}
          >
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
