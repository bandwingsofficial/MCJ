"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

  const [
    profile,
    setProfile,
  ] = useState<StudentProfile | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(enabled);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const data =
        await studentProfileService.getProfile();

      setProfile(data);

      setError(null);
    } catch (fetchError) {
      if (
        fetchError instanceof Error &&
        fetchError.message ===
          "Student not found"
      ) {
        setProfile(null);
        setError(null);
        return;
      }

      setProfile(null);

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch student profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void fetchProfile();
  }, [enabled, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
