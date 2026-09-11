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
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  const [navigation, setNavigation] =
    useState<StudentPortalNavigationState>(
      STUDENT_PORTAL_DEFAULT_NAVIGATION,
    );

  const refetch = useCallback(
    async (mode: "full" | "silent" = "silent") => {
      if (!user) {
        setNavigation({
          ...STUDENT_PORTAL_DEFAULT_NAVIGATION,
          isLoading: false,
          resolvedPathname: pathname,
        });
        return;
      }

      if (mode === "full") {
        setNavigation((current) => ({
          ...current,
          isLoading: true,
          error: null,
        }));
      }

      try {
        const next = await resolveStudentPortalNavigation();
        setNavigation({
          ...next,
          resolvedPathname: pathname,
        });
      } catch (error) {
        setNavigation({
          ...STUDENT_PORTAL_DEFAULT_NAVIGATION,
          isLoading: false,
          resolvedPathname: pathname,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load student portal state.",
        });
      }
    },
    [pathname, user],
  );

  useEffect(() => {
    void refetch("silent");
  }, [refetch]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleFocus = () => {
      void refetch("silent");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refetch("silent");
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
      refetch: () => refetch("full"),
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
