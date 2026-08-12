// src/features/auth/types/profile.types.ts

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  sessionId?: string | null;
}

export interface ProfileResponseDto {
  success: boolean;
  message: string;
  data: ProfileData;
}
