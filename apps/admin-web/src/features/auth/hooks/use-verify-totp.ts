"use client";

import { useState } from "react";

import { authService } from "@/src/features/auth/services/auth.service";

import {
  VerifyTotpRequestDto,
  VerifyTotpResponseDto,
} from "@/src/features/auth/types/auth.types";

export const useVerifyTotp =
  () => {
    const [
      loading,
      setLoading,
    ] = useState(false);

    const verifyTotp =
      async (
        payload: VerifyTotpRequestDto
      ): Promise<VerifyTotpResponseDto> => {
        try {
          setLoading(true);

          return await authService.verifyTotp(
            payload
          );
        } finally {
          setLoading(false);
        }
      };

    return {
      verifyTotp,
      loading,
    };
  };