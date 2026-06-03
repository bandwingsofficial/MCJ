export interface ProfileData {
  id: string;

  email: string;

  name: string;

  role: string;

  phone?: string;

  mfaEnabled: boolean;

  createdAt: string;
}

export interface ProfileResponseDto {
  success: boolean;

  message: string;

  data: ProfileData;
}