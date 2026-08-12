import { SetMetadata } from '@nestjs/common';

import { Permission } from '@modules/branch-user/domain/enums/permission.enum';

// Dormant/future-ready: current authorization is role-only.
export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (
  ...permissions: Permission[]
) => SetMetadata(PERMISSIONS_KEY, permissions);
