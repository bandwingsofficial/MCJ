"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  UpdateEnrollmentStatusRequest,
} from "../types";

import { enrollmentService } from "../services/enrollment.service";

export const useUpdateEnrollmentStatus =
  () => {
    const [isLoading, setLoading] =
      useState(false);

    const updateStatus =
      async (
        id: string,
        payload: UpdateEnrollmentStatusRequest,
      ) => {
        try {
          setLoading(true);

          const response =
            await enrollmentService.updateStatus(
              id,
              payload,
            );

          appToast.success(
            response.message,
          );

          return response;
        } catch (error) {
          appToast.error(getErrorMessage(error));

          throw error;
        } finally {
          setLoading(false);
        }
      };

    return {
      updateStatus,

      isLoading,
    };
  };