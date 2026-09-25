"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Eye, PlayCircle, Plus, X } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  adminReferralRewardsService,
  type ReferralUserUsageRow,
} from "@/src/features/referral-rewards/services/admin-referral-rewards.service";
import { ReferralSettingsTab } from "@/src/features/referral-rewards/components/referral-settings-tab";
import {
  AdminDataTable,
  ReferralRewardsModuleHeader,
  ReferralRewardsNavTabs,
  ReferralRewardsSectionHeader,
  ReferralRewardsTableCard,
  ReferralUserCell,
  formatReferralDateTime,
  type ReferralRewardsTab,
} from "@/src/features/referral-rewards/components/referral-rewards-shared";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 20;

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
const iconClass = "h-[15px] w-[14px] stroke-[2]";

const REFERRAL_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Rewarded", value: "REWARDED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Expired", value: "EXPIRED" },
];

const TX_DIRECTION_OPTIONS = [
  { label: "All Directions", value: "ALL" },
  { label: "Credit", value: "CREDIT" },
  { label: "Debit", value: "DEBIT" },
];

const REDEMPTION_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Processed", value: "PROCESSED" },
];

export function ReferralRewardsAdminPage() {
  const [tab, setTab] = useState<ReferralRewardsTab>("Settings");
  const [settingsCreateTrigger, setSettingsCreateTrigger] = useState(0);
  const queryClient = useQueryClient();

  return (
    <div className="space-y-3">
      <ReferralRewardsModuleHeader
        headerAction={
          tab === "Settings" ? (
            <Button
              type="button"
              onClick={() => setSettingsCreateTrigger((value) => value + 1)}
              className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden />
              Add Configuration
            </Button>
          ) : null
        }
      />

      <ReferralRewardsNavTabs value={tab} onChange={setTab} />

      {tab === "Settings" ? (
        <ReferralSettingsTab createTrigger={settingsCreateTrigger} />
      ) : null}
      {tab === "Referrals" ? <ReferralsTab /> : null}
      {tab === "Referral Users" ? <ReferralUsersTab /> : null}
      {tab === "Coin Transactions" ? <CoinTransactionsTab /> : null}
      {tab === "Redemptions" ? <RedemptionsTab queryClient={queryClient} /> : null}
    </div>
  );
}

function ReferralsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [viewId, setViewId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ["admin-referral-rewards", "referrals", page, pageSize, debouncedSearch, status],
    queryFn: () =>
      adminReferralRewardsService.listReferrals({
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["admin-referral-rewards", "referral", viewId],
    queryFn: () => adminReferralRewardsService.getReferral(viewId!),
    enabled: Boolean(viewId),
  });

  const items = (listQuery.data?.items ?? []) as Array<Record<string, any>>;
  const total = listQuery.data?.total ?? 0;
  const hasActiveFilters = Boolean(debouncedSearch || status !== "ALL");

  return (
    <div className="space-y-3">
      <ReferralRewardsSectionHeader
        sectionTitle="Referrals"
        total={total}
        totalLabel="Total Referrals"
        isLoading={listQuery.isLoading && !listQuery.data}
        search={searchInput}
        searchPlaceholder="Search referrals..."
        onSearchChange={setSearchInput}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSearchInput("");
          setDebouncedSearch("");
          setStatus("ALL");
          setPage(1);
        }}
        filters={
          <div className="w-full sm:w-[140px]">
            <AppSelect
              value={status}
              triggerClassName="h-9 rounded-lg px-2.5 text-sm"
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={REFERRAL_STATUS_OPTIONS}
            />
          </div>
        }
      />

      <ReferralRewardsTableCard
        isLoading={listQuery.isLoading && !listQuery.data}
        isFetching={listQuery.isFetching}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      >
        <AdminDataTable
          columns={["ID", "Referrer", "Referred", "Code", "Status", "Reward", "Actions"]}
          emptyTitle={
            hasActiveFilters ? "No referrals match your filters" : "No referrals yet"
          }
          rows={items.map((item) => [
            <span key="id" className="font-mono text-xs">
              {item.publicId}
            </span>,
            <ReferralUserCell
              key="ref"
              name={item.referrer?.name}
              email={item.referrer?.email}
            />,
            <ReferralUserCell
              key="red"
              name={item.referred?.name}
              email={item.referred?.email}
            />,
            <span className="font-mono text-xs">{item.referralCodeUsed ?? "—"}</span>,
            <StatusPill key="st" value={String(item.status)} />,
            String(item.rewardCoins ?? "—"),
            <div key="act" className="flex justify-end">
              <Tooltip content="View referral">
                <button
                  type="button"
                  className={`${iconButtonClass} text-blue-900`}
                  onClick={() => setViewId(String(item.id))}
                  aria-label="View referral"
                >
                  <Eye className={iconClass} />
                </button>
              </Tooltip>
            </div>,
          ])}
        />
      </ReferralRewardsTableCard>

      <Modal
        open={Boolean(viewId)}
        title="Referral details"
        onClose={() => setViewId(null)}
        contentClassName="max-w-lg"
      >
        {detailQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : detailQuery.data ? (
          <ReferralDetailView data={detailQuery.data as Record<string, unknown>} />
        ) : (
          <p className="text-sm text-[#647A9B]">Unable to load details.</p>
        )}
      </Modal>
    </div>
  );
}

function ReferralUsersTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ["admin-referral-rewards", "referral-users", "v3", page, pageSize, debouncedSearch],
    queryFn: () =>
      adminReferralRewardsService.listReferralUsers({
        search: debouncedSearch || undefined,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
  });

  const totalQuery = useQuery({
    queryKey: ["admin-referral-rewards", "referral-users-total"],
    queryFn: () => adminReferralRewardsService.getDashboard(),
    enabled: !debouncedSearch,
    select: (d) => d.users.totalReferralCodes,
  });

  const rows = listQuery.data ?? [];
  const total = debouncedSearch
    ? rows.length + (page - 1) * pageSize
    : (totalQuery.data ?? rows.length);

  return (
    <div className="space-y-3">
      <ReferralRewardsSectionHeader
        sectionTitle="Referral Users"
        total={total}
        totalLabel="Total Referral Users"
        isLoading={listQuery.isLoading && !listQuery.data}
        search={searchInput}
        searchPlaceholder="Search name, email, code..."
        onSearchChange={setSearchInput}
        hasActiveFilters={Boolean(debouncedSearch)}
        onClearFilters={() => {
          setSearchInput("");
          setDebouncedSearch("");
          setPage(1);
        }}
      />

      <ReferralRewardsTableCard
        isLoading={listQuery.isLoading && !listQuery.data}
        isFetching={listQuery.isFetching}
        page={page}
        pageSize={pageSize}
        total={Math.max(total, rows.length + (page - 1) * pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      >
        <AdminDataTable
          columns={["Owner", "Code", "Uses", "Successful", "Pending", "Coins earned"]}
          rows={rows.map((row: ReferralUserUsageRow) => [
            <div key="o">
              <p className="font-medium text-[#102A56]">{row.owner.name}</p>
              <p className="text-xs text-[#647A9B]">{row.owner.email}</p>
            </div>,
            <span className="font-mono text-xs">{row.owner.referralCode ?? "—"}</span>,
            row.totalUses,
            row.successfulUses,
            row.pendingUses,
            row.coinsEarned,
          ])}
        />
      </ReferralRewardsTableCard>
    </div>
  );
}

function CoinTransactionsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [direction, setDirection] = useState("ALL");

  const listQuery = useQuery({
    queryKey: ["admin-referral-rewards", "transactions", page, pageSize, direction],
    queryFn: () =>
      adminReferralRewardsService.listCoinTransactions({
        direction: direction === "ALL" ? undefined : direction,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
  });

  const items = (listQuery.data?.items ?? []) as Array<Record<string, any>>;
  const total = listQuery.data?.total ?? 0;

  return (
    <div className="space-y-3">
      <ReferralRewardsSectionHeader
        sectionTitle="Coin Transactions"
        total={total}
        totalLabel="Total Transactions"
        isLoading={listQuery.isLoading && !listQuery.data}
        hasActiveFilters={direction !== "ALL"}
        onClearFilters={() => {
          setDirection("ALL");
          setPage(1);
        }}
        filters={
          <div className="w-full sm:w-[150px]">
            <AppSelect
              value={direction}
              triggerClassName="h-9 rounded-lg px-2.5 text-sm"
              onValueChange={(value) => {
                setDirection(value);
                setPage(1);
              }}
              options={TX_DIRECTION_OPTIONS}
            />
          </div>
        }
      />

      <ReferralRewardsTableCard
        isLoading={listQuery.isLoading && !listQuery.data}
        isFetching={listQuery.isFetching}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      >
        <AdminDataTable
          columns={[
            "ID",
            "User",
            "Type",
            "Direction",
            "Coins",
            "Before",
            "After",
            "Date",
          ]}
          rows={items.map((tx) => [
            <span key="id" className="font-mono text-xs">
              {tx.publicId}
            </span>,
            tx.user?.name ?? tx.userId,
            tx.type,
            tx.direction,
            tx.amount,
            tx.availableBefore,
            tx.availableAfter,
            formatReferralDateTime(tx.createdAt),
          ])}
        />
      </ReferralRewardsTableCard>
    </div>
  );
}

function RedemptionsTab({
  queryClient,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [confirm, setConfirm] = useState<{
    id: string;
    action: "approve" | "reject" | "process";
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ["admin-referral-rewards", "redemptions", page, pageSize, debouncedSearch, status],
    queryFn: () =>
      adminReferralRewardsService.listRedemptions({
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
  });

  const redemptionAction = useMutation({
    mutationFn: async (input: {
      id: string;
      action: "approve" | "reject" | "process";
    }) => {
      if (input.action === "approve") {
        return adminReferralRewardsService.approveRedemption(input.id);
      }
      if (input.action === "reject") {
        return adminReferralRewardsService.rejectRedemption(
          input.id,
          "Rejected by admin",
        );
      }
      return adminReferralRewardsService.processRedemption(input.id);
    },
    onSuccess: () => {
      appToast.success("Redemption updated");
      setConfirm(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-referral-rewards"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const items = (listQuery.data?.items ?? []) as Array<Record<string, any>>;
  const total = listQuery.data?.total ?? 0;
  const hasActiveFilters = Boolean(debouncedSearch || status !== "ALL");

  const confirmCopy =
    confirm?.action === "approve"
      ? { title: "Approve redemption?", label: "Approve" }
      : confirm?.action === "reject"
        ? { title: "Reject redemption?", label: "Reject" }
        : { title: "Mark redemption as processed?", label: "Process" };

  return (
    <div className="space-y-3">
      <ReferralRewardsSectionHeader
        sectionTitle="Redemptions"
        total={total}
        totalLabel="Total Redemptions"
        isLoading={listQuery.isLoading && !listQuery.data}
        search={searchInput}
        searchPlaceholder="Search redemptions..."
        onSearchChange={setSearchInput}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSearchInput("");
          setDebouncedSearch("");
          setStatus("ALL");
          setPage(1);
        }}
        filters={
          <div className="w-full sm:w-[140px]">
            <AppSelect
              value={status}
              triggerClassName="h-9 rounded-lg px-2.5 text-sm"
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={REDEMPTION_STATUS_OPTIONS}
            />
          </div>
        }
      />

      <ReferralRewardsTableCard
        isLoading={listQuery.isLoading && !listQuery.data}
        isFetching={listQuery.isFetching}
        page={page}
        pageSize={pageSize}
        total={total}
        actionLoading={redemptionAction.isPending}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      >
        <AdminDataTable
          columns={[
            "Request",
            "User",
            "Coins",
            "Value (paise)",
            "Status",
            "Actions",
          ]}
          rows={items.map((item) => {
            const st = String(item.status);
            return [
              <span key="req" className="font-mono text-xs">
                {item.publicId}
              </span>,
              item.user?.name ?? item.userId,
              item.coins,
              item.moneyValuePaise,
              <StatusPill key="st" value={st} />,
              <div key="act" className="flex justify-end gap-2">
                {st === "PENDING" ? (
                  <>
                    <Tooltip content="Approve">
                      <button
                        type="button"
                        disabled={redemptionAction.isPending}
                        className={`${iconButtonClass} text-green-800`}
                        aria-label="Approve redemption"
                        onClick={() =>
                          setConfirm({ id: String(item.id), action: "approve" })
                        }
                      >
                        <CircleCheck className={iconClass} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Reject">
                      <button
                        type="button"
                        disabled={redemptionAction.isPending}
                        className={`${iconButtonClass} text-red-800`}
                        aria-label="Reject redemption"
                        onClick={() =>
                          setConfirm({ id: String(item.id), action: "reject" })
                        }
                      >
                        <X className={iconClass} />
                      </button>
                    </Tooltip>
                  </>
                ) : null}
                {st === "APPROVED" ? (
                  <Tooltip content="Process">
                    <button
                      type="button"
                      disabled={redemptionAction.isPending}
                      className={`${iconButtonClass} text-blue-900`}
                      aria-label="Process redemption"
                      onClick={() =>
                        setConfirm({ id: String(item.id), action: "process" })
                      }
                    >
                      <PlayCircle className={iconClass} />
                    </button>
                  </Tooltip>
                ) : null}
              </div>,
            ];
          })}
        />
      </ReferralRewardsTableCard>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmCopy.title}
        description="This action is applied immediately on the server."
        confirmLabel={confirmCopy.label}
        loading={redemptionAction.isPending}
        confirmVariant={confirm?.action === "reject" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) redemptionAction.mutate(confirm);
        }}
      />
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const styles =
    normalized === "REWARDED" || normalized === "PROCESSED" || normalized === "APPROVED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : normalized === "PENDING" || normalized === "QUALIFIED"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : normalized === "REJECTED" || normalized === "EXPIRED"
          ? "bg-red-50 text-red-700 ring-red-100"
          : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      {value}
    </span>
  );
}

function ReferralDetailView({ data }: { data: Record<string, unknown> }) {
  const referrer = data.referrer as { name?: string; email?: string } | undefined;
  const referred = data.referred as { name?: string; email?: string } | undefined;
  return (
    <dl className="space-y-2 text-sm">
      <DetailRow label="Status" value={String(data.status ?? "—")} />
      <DetailRow
        label="Referrer"
        value={
          referrer?.name
            ? `${referrer.name}${referrer.email ? `\n${referrer.email}` : ""}`
            : "—"
        }
      />
      <DetailRow
        label="Referred"
        value={
          referred?.name
            ? `${referred.name}${referred.email ? `\n${referred.email}` : ""}`
            : "—"
        }
      />
      <DetailRow label="Code used" value={String(data.referralCodeUsed ?? "—")} />
      <DetailRow label="Reward coins" value={String(data.rewardCoins ?? "—")} />
    </dl>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#E8EEF5] py-2 last:border-0">
      <dt className="text-[#647A9B]">{label}</dt>
      <dd className="whitespace-pre-line text-right font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}
