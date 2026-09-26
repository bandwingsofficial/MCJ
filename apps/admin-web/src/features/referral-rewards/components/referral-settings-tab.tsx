"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Eye, Pencil } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { adminReferralRewardsService } from "@/src/features/referral-rewards/services/admin-referral-rewards.service";
import {
  AdminDataTable,
  ReferralCoinMetric,
  ReferralConfigurationStatusBadge,
  ReferralEnabledBadge,
  ReferralQualificationBadge,
  ReferralRedemptionConfigBadge,
  ReferralRewardsSectionHeader,
  ReferralRewardsTableCard,
} from "@/src/features/referral-rewards/components/referral-rewards-shared";
import {
  ReferralConfigurationModal,
  type ReferralConfigurationModalMode,
} from "@/src/features/referral-rewards/components/referral-configuration-modal";
import {
  formatConfigurationStatus,
  formatQualificationLabel,
  formatRedemptionSummary,
  type ReferralSettingsRecord,
} from "@/src/features/referral-rewards/utils/referral-configuration.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
const iconClass = "h-[15px] w-[14px] stroke-[2]";

function toSettingsRecord(data: Record<string, unknown>): ReferralSettingsRecord {
  return {
    id: String(data.id ?? "default"),
    name: String(data.name ?? "Default Rewards"),
    isActive: Boolean(data.isActive),
    referralEnabled: Boolean(data.referralEnabled),
    rewardCoinsPerReferral: Number(data.rewardCoinsPerReferral ?? 0),
    qualificationCondition: String(data.qualificationCondition ?? "REGISTRATION"),
    referralExpiryDays:
      data.referralExpiryDays == null ? null : Number(data.referralExpiryDays),
    maxReferralsPerReferrer:
      data.maxReferralsPerReferrer == null
        ? null
        : Number(data.maxReferralsPerReferrer),
    redemptionEnabled: Boolean(data.redemptionEnabled),
    coinsPerRupee: Number(data.coinsPerRupee ?? 10),
    minRedemptionCoins: Number(data.minRedemptionCoins ?? 500),
    maxRedemptionCoins:
      data.maxRedemptionCoins == null ? null : Number(data.maxRedemptionCoins),
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
}

interface ReferralSettingsTabProps {
  createTrigger?: number;
}

export function ReferralSettingsTab({ createTrigger = 0 }: ReferralSettingsTabProps) {
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState<ReferralConfigurationModalMode | null>(
    null,
  );
  const [selected, setSelected] = useState<ReferralSettingsRecord | null>(null);
  const [activateTarget, setActivateTarget] = useState<ReferralSettingsRecord | null>(
    null,
  );

  const listQuery = useQuery({
    queryKey: ["admin-referral-rewards", "settings", "list"],
    queryFn: () => adminReferralRewardsService.listSettings(),
  });

  const activeSettingsQuery = useQuery({
    queryKey: ["admin-referral-rewards", "settings", "active"],
    queryFn: () => adminReferralRewardsService.getActiveSettings(),
    enabled: createTrigger > 0,
  });

  const [createTemplate, setCreateTemplate] = useState<ReferralSettingsRecord | null>(
    null,
  );

  useEffect(() => {
    if (createTrigger <= 0) return;
    setSelected(null);
    setModalMode("create");
    void activeSettingsQuery.refetch();
  }, [createTrigger]);

  useEffect(() => {
    if (createTrigger <= 0 || modalMode !== "create") return;
    if (activeSettingsQuery.data) {
      const base = toSettingsRecord(activeSettingsQuery.data);
      setCreateTemplate({ ...base, name: "", isActive: false });
    } else if (!activeSettingsQuery.isFetching) {
      setCreateTemplate(null);
    }
  }, [
    createTrigger,
    modalMode,
    activeSettingsQuery.data,
    activeSettingsQuery.isFetching,
  ]);

  const rows = useMemo(
    () => (listQuery.data ?? []).map((row) => toSettingsRecord(row)),
    [listQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async (input: {
      mode: ReferralConfigurationModalMode;
      payload: Record<string, unknown>;
      id?: string;
    }) => {
      if (input.mode === "create") {
        return adminReferralRewardsService.createSettings(input.payload);
      }
      if (input.id) {
        return adminReferralRewardsService.updateSettings(input.id, input.payload);
      }
      throw new Error("Missing configuration id");
    },
    onSuccess: (_data, variables) => {
      appToast.success(
        variables.mode === "create"
          ? "Configuration created and set as active"
          : "Configuration saved",
      );
      setModalMode(null);
      setSelected(null);
      setCreateTemplate(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-referral-rewards"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminReferralRewardsService.activateSettings(id),
    onSuccess: () => {
      appToast.success("Configuration activated");
      setActivateTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-referral-rewards"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const openForRow = (
    row: ReferralSettingsRecord,
    mode: ReferralConfigurationModalMode,
  ) => {
    setSelected(row);
    setModalMode(mode);
  };

  return (
    <div className="space-y-3">
      <ReferralRewardsSectionHeader
        sectionTitle="Settings"
        total={rows.length}
        totalLabel="Total Configurations"
        isLoading={listQuery.isLoading && !listQuery.data}
      />

      <ReferralRewardsTableCard
        isLoading={listQuery.isLoading && !listQuery.data}
        isFetching={listQuery.isFetching}
        page={1}
        pageSize={10}
        total={rows.length}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        actionLoading={saveMutation.isPending || activateMutation.isPending}
      >
        <AdminDataTable
          columns={[
            "Configuration",
            "Referral Status",
            "Reward Coins",
            "Qualification",
            "Redemption",
            "Status",
            "Actions",
          ]}
          rows={rows.map((row) => [
            <span key="name" className="font-medium text-[#102A56]">
              {row.name}
            </span>,
            <ReferralEnabledBadge key="ref" enabled={row.referralEnabled} />,
            <ReferralCoinMetric
              key="reward"
              variant="reward"
              value={row.rewardCoinsPerReferral}
            />,
            <ReferralQualificationBadge
              key="qual"
              label={formatQualificationLabel(row.qualificationCondition)}
            />,
            <ReferralRedemptionConfigBadge
              key="redemption"
              enabled={row.redemptionEnabled}
              summary={formatRedemptionSummary(row)}
            />,
            <ReferralConfigurationStatusBadge
              key="status"
              active={row.isActive}
              label={formatConfigurationStatus(row)}
            />,
            <div key="actions" className="flex justify-end gap-2">
              <Tooltip content="View configuration">
                <button
                  type="button"
                  className={`${iconButtonClass} text-blue-900`}
                  aria-label="View configuration"
                  onClick={() => openForRow(row, "view")}
                >
                  <Eye className={iconClass} />
                </button>
              </Tooltip>
              <Tooltip content="Edit configuration">
                <button
                  type="button"
                  className={`${iconButtonClass} text-blue-900`}
                  aria-label="Edit configuration"
                  onClick={() => openForRow(row, "edit")}
                >
                  <Pencil className={iconClass} />
                </button>
              </Tooltip>
              {!row.isActive ? (
                <Tooltip content="Activate configuration">
                  <button
                    type="button"
                    disabled={activateMutation.isPending}
                    className={`${iconButtonClass} text-green-800`}
                    aria-label="Activate configuration"
                    onClick={() => setActivateTarget(row)}
                  >
                    <CircleCheck className={iconClass} />
                  </button>
                </Tooltip>
              ) : null}
            </div>,
          ])}
        />
      </ReferralRewardsTableCard>

      <ReferralConfigurationModal
        open={modalMode != null}
        mode={modalMode ?? "view"}
        initial={modalMode === "create" ? createTemplate : selected}
        saving={saveMutation.isPending}
        onClose={() => {
          setModalMode(null);
          setSelected(null);
        }}
        onSave={(payload) => {
          if (!modalMode || modalMode === "view") return;
          saveMutation.mutate({
            mode: modalMode,
            payload,
            id: selected?.id,
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(activateTarget)}
        title="Activate this configuration?"
        description={`${activateTarget?.name ?? "This configuration"} will become active. The currently active configuration will be set to inactive.`}
        confirmLabel="Activate"
        confirmVariant="success"
        loading={activateMutation.isPending}
        onCancel={() => setActivateTarget(null)}
        onConfirm={() => {
          if (activateTarget) {
            activateMutation.mutate(activateTarget.id);
          }
        }}
      />
    </div>
  );
}

