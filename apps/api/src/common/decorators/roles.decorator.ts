import { SetMetadata } from '@nestjs/common';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: BranchUserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
