import type { ProfileDto } from "@/src/features/auth/types/profile.types";

type BranchUserMeApiPayload = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[];
  branchId: string;
  branch?: {
    id: string;
    branchName: string;
    branchCode: string;
    city?: string | null;
    phone?: string | null;
  } | null;
  isActive: boolean;
  lastLoginAt: string | null;
};

export function mapBranchUserMeToProfile(
  payload: BranchUserMeApiPayload,
): ProfileDto {
  return {
    id: payload.id,
    firstName: payload.firstName,
    lastName: payload.lastName ?? "",
    email: payload.email,
    phone: payload.phone ?? "",
    role: payload.role,
    permissions: payload.permissions ?? [],
    branchId: payload.branchId,
    branch: payload.branch ?? null,
    isActive: payload.isActive,
    lastLoginAt: payload.lastLoginAt,
  };
}
