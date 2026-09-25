"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";

import type { ReferralSettingsRecord } from "@/src/features/referral-rewards/utils/referral-configuration.utils";

const QUALIFICATION_OPTIONS = [
  { label: "Registration", value: "REGISTRATION" },
  { label: "Email verification", value: "EMAIL_VERIFICATION" },
  { label: "Phone verification", value: "PHONE_VERIFICATION" },
  { label: "Enrollment", value: "ENROLLMENT" },
  { label: "Paid enrollment", value: "PAID_ENROLLMENT" },
];

export type ReferralConfigurationModalMode = "create" | "edit" | "view";

interface ReferralConfigurationModalProps {
  open: boolean;
  mode: ReferralConfigurationModalMode;
  initial: ReferralSettingsRecord | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
}

function buildFormState(initial: ReferralSettingsRecord | null) {
  return {
    name: initial?.name ?? "",
    referralEnabled: Boolean(initial?.referralEnabled ?? true),
    rewardCoinsPerReferral: Number(initial?.rewardCoinsPerReferral ?? 100),
    qualificationCondition: initial?.qualificationCondition ?? "REGISTRATION",
    referralExpiryDays:
      initial?.referralExpiryDays == null ? "" : String(initial.referralExpiryDays),
    maxReferralsPerReferrer:
      initial?.maxReferralsPerReferrer == null
        ? ""
        : String(initial.maxReferralsPerReferrer),
    redemptionEnabled: Boolean(initial?.redemptionEnabled ?? true),
    coinsPerRupee: Number(initial?.coinsPerRupee ?? 10),
    minRedemptionCoins: Number(initial?.minRedemptionCoins ?? 500),
    maxRedemptionCoins:
      initial?.maxRedemptionCoins == null ? "" : String(initial.maxRedemptionCoins),
  };
}

export function ReferralConfigurationModal({
  open,
  mode,
  initial,
  saving = false,
  onClose,
  onSave,
}: ReferralConfigurationModalProps) {
  const readOnly = mode === "view";
  const [form, setForm] = useState(buildFormState(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(buildFormState(initial));
      setError(null);
    }
  }, [open, initial]);

  const title =
    mode === "view"
      ? "View configuration"
      : mode === "create"
        ? "Add configuration"
        : "Edit configuration";

  const handleSubmit = () => {
    if (readOnly) {
      onClose();
      return;
    }

    if (!form.name.trim()) {
      setError("Configuration name is required.");
      return;
    }

    if (form.rewardCoinsPerReferral < 0) {
      setError("Reward coins must be 0 or greater.");
      return;
    }
    if (form.coinsPerRupee < 1) {
      setError("Coin conversion rate must be at least 1.");
      return;
    }
    if (form.minRedemptionCoins < 1) {
      setError("Minimum redemption must be at least 1 coin.");
      return;
    }

    setError(null);
    onSave({
      name: form.name.trim(),
      referralEnabled: form.referralEnabled,
      rewardCoinsPerReferral: form.rewardCoinsPerReferral,
      qualificationCondition: form.qualificationCondition,
      referralExpiryDays: form.referralExpiryDays
        ? Number(form.referralExpiryDays)
        : null,
      maxReferralsPerReferrer: form.maxReferralsPerReferrer
        ? Number(form.maxReferralsPerReferrer)
        : null,
      redemptionEnabled: form.redemptionEnabled,
      coinsPerRupee: form.coinsPerRupee,
      minRedemptionCoins: form.minRedemptionCoins,
      maxRedemptionCoins: form.maxRedemptionCoins
        ? Number(form.maxRedemptionCoins)
        : null,
    });
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!saving) onClose();
      }}
      contentClassName="max-w-lg"
      bodyClassName="max-h-[min(70vh,640px)] overflow-y-auto"
    >
      <div className="space-y-4">
        <Field label="Configuration name">
          <Input
            value={form.name}
            disabled={readOnly}
            placeholder="e.g. Default Rewards"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Field>

        <Field label="Referral enabled">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={form.referralEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, referralEnabled: e.target.checked }))
              }
            />
            <span className="text-[#647A9B]">Allow referral program</span>
          </label>
        </Field>

        <Field label="Reward coins per referral">
          <Input
            type="number"
            min={0}
            disabled={readOnly}
            value={form.rewardCoinsPerReferral}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                rewardCoinsPerReferral: Number(e.target.value),
              }))
            }
          />
        </Field>

        <Field label="Qualification condition">
          <AppSelect
            value={form.qualificationCondition}
            disabled={readOnly}
            triggerClassName="h-9 w-full"
            onValueChange={(value) =>
              setForm((f) => ({ ...f, qualificationCondition: value }))
            }
            options={QUALIFICATION_OPTIONS}
          />
        </Field>

        <Field label="Referral expiry (days, optional)">
          <Input
            type="number"
            min={1}
            disabled={readOnly}
            placeholder="No expiry"
            value={form.referralExpiryDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, referralExpiryDays: e.target.value }))
            }
          />
        </Field>

        <Field label="Max referrals per referrer (optional)">
          <Input
            type="number"
            min={1}
            disabled={readOnly}
            placeholder="Unlimited"
            value={form.maxReferralsPerReferrer}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxReferralsPerReferrer: e.target.value }))
            }
          />
        </Field>

        <Field label="Redemption enabled">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={form.redemptionEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, redemptionEnabled: e.target.checked }))
              }
            />
            <span className="text-[#647A9B]">Allow coin redemption</span>
          </label>
        </Field>

        <Field label="Coin conversion rate (coins per ₹1)">
          <Input
            type="number"
            min={1}
            disabled={readOnly}
            value={form.coinsPerRupee}
            onChange={(e) =>
              setForm((f) => ({ ...f, coinsPerRupee: Number(e.target.value) }))
            }
          />
        </Field>

        <Field label="Minimum redemption coins">
          <Input
            type="number"
            min={1}
            disabled={readOnly}
            value={form.minRedemptionCoins}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minRedemptionCoins: Number(e.target.value),
              }))
            }
          />
        </Field>

        <Field label="Maximum redemption coins (optional)">
          <Input
            type="number"
            min={1}
            disabled={readOnly}
            placeholder="No maximum"
            value={form.maxRedemptionCoins}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxRedemptionCoins: e.target.value }))
            }
          />
        </Field>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly ? (
            <Button type="button" loading={saving} onClick={handleSubmit}>
              {mode === "create" ? "Create configuration" : "Save changes"}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-[#102A56]">{label}</span>
      {children}
    </label>
  );
}
