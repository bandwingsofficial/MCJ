import type { PortalAccountStatus } from "@/src/features/users/services/admin-users.service";

export interface AdminUserDetailPayload {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    referralCode: string | null;
    accountStatus: PortalAccountStatus;
    createdAt: string;
    lastLoginAt: string | null;
    suspendedAt?: string | null;
    deletedAt?: string | null;
    deletionReason?: string | null;
  };
  referralSummary?: {
    user?: {
      coinWallet?: {
        availableCoins?: number;
        lockedCoins?: number;
        totalEarned?: number;
        totalRedeemed?: number;
      };
      referralAsReferred?: unknown;
    };
    stats?: {
      totalReferrals?: number;
      successful?: number;
      coinsEarned?: number;
    };
    referrals?: Array<Record<string, unknown>>;
  };
  referralStats?: {
    successfulReferrals?: number;
    pendingReferrals?: number;
  };
}
