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

export function useStudentProfile() {
  const [
    profile,
    setProfile,
  ] = useState<StudentProfile | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

 const fetchProfile =
  useCallback(async () => {
    try {
      setIsLoading(true);

      const data =
        await studentProfileService.getProfile();

      setProfile(data);

      setError(null);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Student not found"
      ) {
        // First time student
        setProfile(null);

        setError(null);

        return;
      }

      setProfile(null);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch student profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch:
      fetchProfile,
  };
}