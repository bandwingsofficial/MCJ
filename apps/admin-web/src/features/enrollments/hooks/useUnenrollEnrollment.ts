"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "../services/enrollment.service";

export function useUnenrollEnrollment() {
  const [isLoading, setIsLoading] = useState(false);

  const unenrollEnrollment = async (id: string, reason?: string) => {
    setIsLoading(true);

    try {
      const response = await enrollmentService.unenrollEnrollment(id, reason);
      appToast.success(response.message);
      return response;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { unenrollEnrollment, isLoading };
}
