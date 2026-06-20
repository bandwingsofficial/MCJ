"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import {
  CreateEnrollmentRequest,
} from "../types";

import { enrollmentService } from "../services/enrollment.service";

export const useCreateEnrollment =
  () => {
    const [isLoading, setLoading] =
      useState(false);

    const createEnrollment =
      async (
        payload: CreateEnrollmentRequest,
      ) => {
        try {
          setLoading(true);

          const response =
            await enrollmentService.createEnrollment(
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
              : "Failed to create enrollment";

          appToast.error(
            message,
          );

          throw error;
        } finally {
          setLoading(false);
        }
      };

    return {
      createEnrollment,

      isLoading,
    };
  };