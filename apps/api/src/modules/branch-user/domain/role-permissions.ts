import { BranchUserRole } from './enums/branch-user-role.enum';
import { Permission } from './enums/permission.enum';

const MANAGER_PERMISSIONS: Permission[] = [
  Permission.BRANCH_USER_CREATE,
  Permission.BRANCH_USER_READ,
  Permission.BRANCH_USER_UPDATE,
  Permission.BRANCH_USER_DELETE,
  Permission.BRANCH_USER_ACTIVATE,
  Permission.BRANCH_USER_DEACTIVATE,
  Permission.BRANCH_USER_ASSIGN_ROLE,
  Permission.STUDENT_CREATE,
  Permission.STUDENT_READ,
  Permission.STUDENT_UPDATE,
  Permission.STUDENT_DELETE,
  Permission.COURSE_READ,
  Permission.PAYMENT_READ,
  Permission.REPORT_READ,
  Permission.BATCH_READ,
  Permission.ATTENDANCE_READ,
  Permission.ATTENDANCE_WRITE,
  Permission.ASSESSMENT_READ,
  Permission.ASSESSMENT_WRITE,
  Permission.JOB_APPLICATION_READ,
  Permission.JOB_APPLICATION_UPDATE,
  Permission.INTERVIEW_READ,
  Permission.INTERVIEW_WRITE,
  Permission.PLACEMENT_READ,
];

const FACULTY_PERMISSIONS: Permission[] = [
  Permission.BATCH_READ,
  Permission.STUDENT_READ,
  Permission.ATTENDANCE_READ,
  Permission.ATTENDANCE_WRITE,
  Permission.ASSESSMENT_READ,
  Permission.ASSESSMENT_WRITE,
];

const INTERVIEWER_PERMISSIONS: Permission[] = [
  Permission.JOB_APPLICATION_READ,
  Permission.JOB_APPLICATION_UPDATE,
  Permission.INTERVIEW_READ,
  Permission.INTERVIEW_WRITE,
  Permission.PLACEMENT_READ,
];

const STAFF_PERMISSIONS: Permission[] = [
  Permission.STUDENT_READ,
  Permission.STUDENT_CREATE,
  Permission.STUDENT_UPDATE,
  Permission.BATCH_READ,
  Permission.PAYMENT_READ,
];

export const ROLE_DEFAULT_PERMISSIONS: Record<
  BranchUserRole,
  Permission[]
> = {
  [BranchUserRole.BRANCH_MANAGER]: MANAGER_PERMISSIONS,
  [BranchUserRole.FACULTY]: FACULTY_PERMISSIONS,
  [BranchUserRole.INTERVIEWER]: INTERVIEWER_PERMISSIONS,
  [BranchUserRole.STAFF]: STAFF_PERMISSIONS,
  [BranchUserRole.RECEPTIONIST]: [
    Permission.STUDENT_READ,
    Permission.STUDENT_CREATE,
  ],
  [BranchUserRole.ACCOUNTANT]: [
    Permission.PAYMENT_READ,
    Permission.PAYMENT_CREATE,
    Permission.REPORT_READ,
  ],
  [BranchUserRole.FACULTY_COORDINATOR]: [
    Permission.BATCH_READ,
    Permission.STUDENT_READ,
    Permission.ATTENDANCE_READ,
    Permission.ASSESSMENT_READ,
  ],
  [BranchUserRole.COUNSELOR]: [
    Permission.STUDENT_READ,
    Permission.JOB_APPLICATION_READ,
    Permission.PLACEMENT_READ,
  ],
};

export const BRANCH_MANAGER_CREATABLE_ROLES: BranchUserRole[] = [
  BranchUserRole.FACULTY,
  BranchUserRole.INTERVIEWER,
];

export function canBranchManagerCreateRole(
  role: string,
): role is BranchUserRole {
  return BRANCH_MANAGER_CREATABLE_ROLES.includes(role as BranchUserRole);
}

export const SUPER_ADMIN_FORBIDDEN_BRANCH_ROLES: BranchUserRole[] = [
  BranchUserRole.FACULTY,
  BranchUserRole.INTERVIEWER,
];

export const SUPER_ADMIN_CREATABLE_ROLES: BranchUserRole[] = [
  BranchUserRole.BRANCH_MANAGER,
];

export function isSuperAdminForbiddenBranchRole(
  role: BranchUserRole,
): boolean {
  return SUPER_ADMIN_FORBIDDEN_BRANCH_ROLES.includes(role);
}

export function isSuperAdminCreatableRole(role: string): boolean {
  return SUPER_ADMIN_CREATABLE_ROLES.includes(role as BranchUserRole);
}

export function getDefaultPermissionsForRole(
  role: BranchUserRole,
): Permission[] {
  return [...(ROLE_DEFAULT_PERMISSIONS[role] ?? [])];
}

export function resolveEffectivePermissions(
  role: BranchUserRole | string | undefined,
  permissions: Permission[] | undefined,
): Permission[] {
  if (permissions?.length) {
    return permissions;
  }

  if (
    role &&
    Object.values(BranchUserRole).includes(role as BranchUserRole)
  ) {
    return getDefaultPermissionsForRole(role as BranchUserRole);
  }

  return [];
}
