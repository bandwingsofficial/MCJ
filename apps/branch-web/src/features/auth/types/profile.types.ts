export interface ProfileDto {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  role: string;

  permissions: string[];

  branchId: string;

  isActive: boolean;

  lastLoginAt: string | null;
}

export interface ProfileResponseDto {
  success: boolean;

  message: string;

  data: ProfileDto;
}