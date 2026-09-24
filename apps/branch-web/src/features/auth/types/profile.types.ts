export interface CurrentBranchProfile {
  id: string;
  branchName: string;
  branchCode: string;
  city?: string | null;
  phone?: string | null;
}

export interface ProfileDto {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  role: string;

  permissions: string[];

  branchId: string;

  branch?: CurrentBranchProfile | null;

  isActive: boolean;

  lastLoginAt: string | null;
}

export interface ProfileResponseDto {
  success: boolean;

  message: string;

  data: ProfileDto;
}
