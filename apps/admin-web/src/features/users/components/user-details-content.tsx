"use client";

import type { AdminUserDetailPayload } from "@/src/features/users/types/user-detail.types";
import { UserStatusBadge } from "@/src/features/users/components/user-status-badge";
import type { PortalAccountStatus } from "@/src/features/users/services/admin-users.service";

interface UserDetailsContentProps {
  payload: AdminUserDetailPayload;
  transactions?: Array<Record<string, unknown>>;
  redemptions?: Array<Record<string, unknown>>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#E8EEF5] py-2 text-sm last:border-0">
      <span className="text-[#647A9B]">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-[#102A56]">
        {value}
      </span>
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
    <section className="rounded-xl border border-[#E1EBF5] bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-[#102A56]">{title}</h3>
      {children}
    </section>
  );
}

export function UserDetailsContent({
  payload,
  transactions = [],
  redemptions = [],
}: UserDetailsContentProps) {
  const user = payload.user;
  const wallet = payload.referralSummary?.user?.coinWallet;
  const stats = payload.referralSummary?.stats;
  const accountStatus = user.accountStatus as PortalAccountStatus;

  const referredBy =
    (
      payload.referralSummary?.user?.referralAsReferred as {
        referrer?: { name?: string };
      } | null
    )?.referrer?.name ?? "None";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-lg font-semibold text-[#102A56]">{user.name}</p>
        <UserStatusBadge status={accountStatus} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Basic information">
          <DetailRow label="Email" value={user.email ?? "—"} />
          <DetailRow label="Phone" value={user.phone ?? "—"} />
          <DetailRow label="Referral code" value={user.referralCode ?? "—"} />
          <DetailRow
            label="Created"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "—"
            }
          />
          {user.lastLoginAt ? (
            <DetailRow
              label="Last login"
              value={new Date(user.lastLoginAt).toLocaleString()}
            />
          ) : null}
        </Section>

        <Section title="Wallet">
          <DetailRow
            label="Available"
            value={String(wallet?.availableCoins ?? 0)}
          />
          <DetailRow label="Locked" value={String(wallet?.lockedCoins ?? 0)} />
          <DetailRow
            label="Total earned"
            value={String(wallet?.totalEarned ?? 0)}
          />
          <DetailRow
            label="Total redeemed"
            value={String(wallet?.totalRedeemed ?? 0)}
          />
        </Section>

        <Section title="Referral summary">
          <DetailRow label="Referred by" value={referredBy} />
          <DetailRow
            label="Total referrals"
            value={String(stats?.totalReferrals ?? 0)}
          />
          <DetailRow
            label="Successful"
            value={String(payload.referralStats?.successfulReferrals ?? 0)}
          />
          <DetailRow
            label="Pending"
            value={String(payload.referralStats?.pendingReferrals ?? 0)}
          />
          <DetailRow
            label="Coins earned"
            value={String(stats?.coinsEarned ?? 0)}
          />
        </Section>

        <Section title="Account timeline">
          <DetailRow
            label="Registered"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "—"
            }
          />
          {user.suspendedAt ? (
            <DetailRow
              label="Suspended"
              value={new Date(user.suspendedAt).toLocaleString()}
            />
          ) : null}
          {user.deletedAt ? (
            <DetailRow
              label="Deleted"
              value={new Date(user.deletedAt).toLocaleString()}
            />
          ) : null}
          {user.deletionReason ? (
            <DetailRow label="Deletion reason" value={user.deletionReason} />
          ) : null}
        </Section>
      </div>

      <Section title="Referral history">
        {!payload.referralSummary?.referrals?.length ? (
          <p className="text-sm text-[#647A9B]">No referrals.</p>
        ) : (
          <ul className="divide-y divide-[#E8EEF5]">
            {payload.referralSummary.referrals.map((item) => (
              <li
                key={String(item.id)}
                className="flex justify-between py-2 text-sm"
              >
                <span>
                  {(item.referred as { name?: string })?.name ?? "—"}
                </span>
                <span className="text-[#647A9B]">{String(item.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Coin transactions">
        {!transactions.length ? (
          <p className="text-sm text-[#647A9B]">No transactions.</p>
        ) : (
          <ul className="max-h-40 divide-y divide-[#E8EEF5] overflow-y-auto">
            {transactions.map((tx) => (
              <li
                key={String(tx.id)}
                className="flex justify-between py-2 text-sm"
              >
                <span>
                  {String(tx.type)} · {String(tx.direction)}
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
        {!redemptions.length ? (
          <p className="text-sm text-[#647A9B]">No redemption requests.</p>
        ) : (
          <ul className="divide-y divide-[#E8EEF5]">
            {redemptions.map((row) => (
              <li
                key={String(row.id)}
                className="flex justify-between py-2 text-sm"
              >
                <span>{String(row.status)}</span>
                <span className="tabular-nums">
                  {String(row.coinsRequested ?? row.coins ?? "—")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
