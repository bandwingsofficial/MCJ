"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useOptionalStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";
import { studentProfileService } from "@/src/features/student/services";

import type {
  StudentProfile,
} from "@/src/features/student/types";

interface UseStudentProfileOptions {
  enabled?: boolean;
}

export function useStudentProfile(
  options?: UseStudentProfileOptions,
) {
  const enabled = options?.enabled ?? true;
  const portalContext = useOptionalStudentPortalNavigation();

  const [
    standaloneProfile,
    setStandaloneProfile,
  ] = useState<StudentProfile | null>(
    null,
  );

  const [
    standaloneLoading,
    setStandaloneLoading,
  ] = useState(
    enabled && !portalContext,
  );

  const [
    standaloneError,
    setStandaloneError,
  ] = useState<string | null>(
    null,
  );

  const fetchStandaloneProfile = useCallback(async () => {
    try {
      setStandaloneLoading(true);

      const data =
        await studentProfileService.getProfileOrNull();

      setStandaloneProfile(data);
      setStandaloneError(null);
    } catch (fetchError) {
      setStandaloneProfile(null);
      setStandaloneError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch student profile.",
      );
    } finally {
      setStandaloneLoading(false);
    }
  }, []);

  useEffect(() => {
    if (portalContext || !enabled) {
      setStandaloneProfile(null);
      setStandaloneError(null);
      setStandaloneLoading(false);
      return;
    }

    void fetchStandaloneProfile();
  }, [enabled, fetchStandaloneProfile, portalContext]);

  if (portalContext) {
    if (!enabled) {
      return {
        profile: null,
        isLoading: false,
        error: null,
        refetch: portalContext.refetch,
      };
    }

    return {
      profile: portalContext.studentProfile,
      isLoading: portalContext.isLoading,
      error: portalContext.error,
      refetch: portalContext.refetch,
    };
  }

  return {
    profile: standaloneProfile,
    isLoading: standaloneLoading,
    error: standaloneError,
    refetch: fetchStandaloneProfile,
  };
}

export function useStudentProfileMutationRefetch() {
  const portalContext = useOptionalStudentPortalNavigation();

  return portalContext?.refetch;
}
