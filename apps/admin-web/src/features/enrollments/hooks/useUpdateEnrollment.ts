"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import {
  UpdateEnrollmentRequest,
} from "../types";

import { enrollmentService } from "../services/enrollment.service";

export const useUpdateEnrollment =
  () => {
    const [isLoading, setLoading] =
      useState(false);

    const updateEnrollment =
      async (
        id: string,
        payload: UpdateEnrollmentRequest,
      ) => {
        try {
          setLoading(true);

          const response =
            await enrollmentService.updateEnrollment(
              id,
              payload,
            );

          appToast.success(
            response.message,
          );

          return response;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update enrollment";

          appToast.error(
            message,
          );

          throw error;
        } finally {
          setLoading(false);
        }
      };

    return {
      updateEnrollment,

      isLoading,
    };
  };