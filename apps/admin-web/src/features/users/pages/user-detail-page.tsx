"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { Button } from "@/src/shared/components/ui/button";
import { adminUsersService } from "@/src/features/users/services/admin-users.service";
import type { AdminUserDetailPayload } from "@/src/features/users/types/user-detail.types";
import { useState } from "react";

export function UserDetailPage({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "unsuspend" | "delete" | null
  >(null);

  const detailQuery = useQuery({
    queryKey: ["admin-users", userId],
    queryFn: () => adminUsersService.getById(userId),
  });

  const transactionsQuery = useQuery({
    queryKey: ["admin-users", userId, "transactions"],
    queryFn: () => adminUsersService.listCoinTransactions(userId, { take: 50 }),
  });

  const redemptionsQuery = useQuery({
    queryKey: ["admin-users", userId, "redemptions"],
    queryFn: () => adminUsersService.listRedemptions(userId),
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "suspend" | "unsuspend" | "delete") => {
      if (action === "suspend") return adminUsersService.suspend(userId);
      if (action === "unsuspend") return adminUsersService.unsuspend(userId);
      return adminUsersService.deletePermanently(userId, "Deleted by admin");
    },
    onSuccess: () => {
      toast.success("Updated");
      setConfirmAction(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Action failed"),
  });

  if (detailQuery.isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const payload = detailQuery.data as AdminUserDetailPayload | undefined;

  const user = payload?.user;
  const wallet = payload?.referralSummary?.user?.coinWallet;
  const stats = payload?.referralSummary?.stats;
  const accountStatus = user?.accountStatus as string | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/users" className="text-sm text-[#2563EB] hover:underline">
            ← Users
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[#102A56]">
            {(user?.name as string) ?? "User"}
          </h1>
          <p className="text-sm text-[#647A9B]">{user?.email as string}</p>
        </div>
        {accountStatus === "ACTIVE" ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmAction("suspend")}>
              Suspend
            </Button>
            <Button variant="danger" onClick={() => setConfirmAction("delete")}>
              Delete permanently
            </Button>
          </div>
        ) : null}
        {accountStatus === "SUSPENDED" ? (
          <div className="flex gap-2">
            <Button onClick={() => setConfirmAction("unsuspend")}>Unsuspend</Button>
            <Button variant="danger" onClick={() => setConfirmAction("delete")}>
              Delete permanently
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Basic information">
          <Row label="Status" value={accountStatus ?? "—"} />
          <Row label="Phone" value={(user?.phone as string) ?? "—"} />
          <Row label="Referral code" value={(user?.referralCode as string) ?? "—"} />
          <Row
            label="Created"
            value={
              user?.createdAt
                ? new Date(user.createdAt as string).toLocaleString()
                : "—"
            }
          />
        </Section>
        <Section title="Wallet">
          <Row label="Available" value={String(wallet?.availableCoins ?? 0)} />
          <Row label="Locked" value={String(wallet?.lockedCoins ?? 0)} />
          <Row label="Total earned" value={String(wallet?.totalEarned ?? 0)} />
          <Row label="Total redeemed" value={String(wallet?.totalRedeemed ?? 0)} />
        </Section>
        <Section title="Referral summary">
          <Row
            label="Referred by"
            value={
              (
                payload?.referralSummary?.user?.referralAsReferred as {
                  referrer?: { name?: string };
                } | null
              )?.referrer?.name ?? "None"
            }
          />
          <Row label="Total referrals" value={String(stats?.totalReferrals ?? 0)} />
          <Row
            label="Successful"
            value={String(payload?.referralStats?.successfulReferrals ?? 0)}
          />
          <Row
            label="Pending"
            value={String(payload?.referralStats?.pendingReferrals ?? 0)}
          />
          <Row label="Coins earned" value={String(stats?.coinsEarned ?? 0)} />
        </Section>
      </div>

      <Section title="Referral history">
        {!payload?.referralSummary?.referrals?.length ? (
          <p className="text-sm text-[#647A9B]">No referrals.</p>
        ) : (
          <ul className="divide-y divide-[#E8EEF5]">
            {payload.referralSummary.referrals.map((item) => (
              <li key={item.id as string} className="py-2 text-sm">
                {(item.referred as { name?: string })?.name ?? "—"} —{" "}
                {item.status as string}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Coin transactions">
        {!transactionsQuery.data?.items?.length ? (
          <p className="text-sm text-[#647A9B]">No transactions.</p>
        ) : (
          <ul className="divide-y divide-[#E8EEF5]">
            {transactionsQuery.data.items.map((tx) => (
              <li key={tx.id as string} className="flex justify-between py-2 text-sm">
                <span>
                  {tx.type as string} · {tx.direction as string}
                </span>
                <span className="tabular-nums font-medium">
                  {String(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Redemptions">
        {!redemptionsQuery.data?.items?.length ? (
          <p className="text-sm text-[#647A9B]">No redemption requests.</p>
        ) : (
          <ul className="divide-y divide-[#E8EEF5]">
            {redemptionsQuery.data.items.map((row) => (
              <li key={row.id as string} className="flex justify-between py-2 text-sm">
                <span>{row.status as string}</span>
                <span className="tabular-nums">{String(row.coinsRequested)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Account timeline">
        <Row
          label="Registered"
          value={
            user?.createdAt
              ? new Date(user.createdAt as string).toLocaleString()
              : "—"
          }
        />
        {user?.suspendedAt ? (
          <Row
            label="Suspended"
            value={new Date(user.suspendedAt as string).toLocaleString()}
          />
        ) : null}
        {user?.deletedAt ? (
          <Row
            label="Deleted"
            value={new Date(user.deletedAt as string).toLocaleString()}
          />
        ) : null}
        {user?.deletionReason ? (
          <Row label="Deletion reason" value={user.deletionReason} />
        ) : null}
      </Section>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={
          confirmAction === "delete"
            ? "Delete permanently?"
            : confirmAction === "suspend"
              ? "Suspend user?"
              : "Unsuspend user?"
        }
        description="This action is enforced on the backend. Wallet and referral history are retained for audit; account access is removed permanently."
        confirmLabel={
          confirmAction === "delete" ? "Delete permanently" : "Confirm"
        }
        loading={actionMutation.isPending}
        onConfirm={() => {
          if (confirmAction) actionMutation.mutate(confirmAction);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E8EEF5] bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-[#102A56]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#E8EEF5] py-2 text-sm last:border-0">
      <span className="text-[#647A9B]">{label}</span>
      <span className="font-medium text-[#102A56]">{value}</span>
    </div>
  );
}
