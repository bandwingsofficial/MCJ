"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { studentPortalService } from "@/src/features/student-portal/services/student-portal.service";

import { appToast } from "@/src/shared/components/ui/toast";

import type {
  StudentPortalAccess,
} from "@/src/features/student-portal/types/student-portal.types";

interface UseStudentPortalReturn {
  access: StudentPortalAccess | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export function useStudentPortal(): UseStudentPortalReturn {
  const router =
    useRouter();

  const [
    access,
    setAccess,
  ] =
    useState<StudentPortalAccess | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const fetchAccess =
    async () => {
      setIsLoading(
        true,
      );

      setError(
        null,
      );

      try {
        const data =
          await studentPortalService.getAccess();

        setAccess(
          data,
        );
      } catch (
        error: any
      ) {
        setAccess(
          null,
        );

        const status =
          error?.response?.status;

        const message =
          error?.response?.data?.message ??
          "Failed to verify student portal access.";

        /**
         * Student profile not created
         */
        if (
          status === 404 &&
          message ===
            "Student profile not found."
        ) {
          appToast.info(
            "Please create your student profile to continue.",
          );

          setIsLoading(
            false,
          );

          router.replace(
            "/student/profile",
          );

          return;
        }

        /**
         * Student has not enrolled yet
         */
        if (
          status === 404 &&
          message ===
            "No enrollment found."
        ) {
          appToast.info(
            "Please enroll in a course first.",
          );

          setIsLoading(
            false,
          );

          router.replace(
            "/student/dashboard",
          );

          return;
        }

        appToast.error(
          message,
        );

        setError(
          message,
        );
      }

      setIsLoading(
        false,
      );
    };

  useEffect(() => {
    void fetchAccess();
  }, []);

  return {
    access,

    isLoading,

    error,

    refetch:
      fetchAccess,
  };
}