"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { resolveStudentPortalNavigation } from "@/src/features/student/services/student-portal-navigation.service";
import {
  STUDENT_PORTAL_DEFAULT_NAVIGATION,
  type StudentPortalNavigationState,
} from "@/src/features/student/types/student-portal-navigation.types";

interface StudentPortalNavigationContextValue
  extends StudentPortalNavigationState {
  refetch: () => Promise<void>;
}

const StudentPortalNavigationContext =
  createContext<StudentPortalNavigationContextValue | null>(
    null,
  );

export function StudentPortalNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  const [navigation, setNavigation] =
    useState<StudentPortalNavigationState>(
      STUDENT_PORTAL_DEFAULT_NAVIGATION,
    );

  const refetch = useCallback(async () => {
    if (!user) {
      setNavigation({
        ...STUDENT_PORTAL_DEFAULT_NAVIGATION,
        isLoading: false,
      });
      return;
    }

    setNavigation((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    try {
      const next = await resolveStudentPortalNavigation();
      setNavigation(next);
    } catch (error) {
      setNavigation({
        ...STUDENT_PORTAL_DEFAULT_NAVIGATION,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load student portal state.",
      });
    }
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleFocus = () => {
      void refetch();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refetch();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refetch, user]);

  const value = useMemo(
    () => ({
      ...navigation,
      refetch,
    }),
    [navigation, refetch],
  );

  return (
    <StudentPortalNavigationContext.Provider value={value}>
      {children}
    </StudentPortalNavigationContext.Provider>
  );
}

export function useStudentPortalNavigation() {
  const context = useContext(
    StudentPortalNavigationContext,
  );

  if (!context) {
    throw new Error(
      "useStudentPortalNavigation must be used within StudentPortalNavigationProvider.",
    );
  }

  return context;
}

export function useOptionalStudentPortalNavigation() {
  return useContext(StudentPortalNavigationContext);
}

export function useStudentPortalState() {
  return useStudentPortalNavigation();
}
