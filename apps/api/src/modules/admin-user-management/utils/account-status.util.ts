import { AccountStatus } from '@prisma/client';

export type PortalAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export function resolvePortalAccountStatus(user: {
  deletedAt: Date | null;
  status: AccountStatus;
}): PortalAccountStatus {
  if (user.deletedAt) {
    return 'DELETED';
  }
  if (user.status === AccountStatus.BLOCKED) {
    return 'SUSPENDED';
  }
  return 'ACTIVE';
}
