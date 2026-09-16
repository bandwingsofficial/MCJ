"use client";

import { useCallback, useEffect, useState } from "react";

import { env } from "@/src/core/config/env";
import { tokenStorage } from "@/src/core/storage/token-storage";
import { authService } from "@/src/features/auth/services/auth.service";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import {
  isAdmittedStudentStatus,
  isValidLearningEnrollmentStatus,
} from "@/src/features/access/utils/student-access";
import { learningService } from "@/src/features/learning/services/learning.service";

export type LearningAccessState =
  | "loading"
  | "allowed"
  | "redirecting";

export function useLearningAccessGuard() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [state, setState] = useState<LearningAccessState>("loading");

  const redirectToCustomerWeb = useCallback(() => {
    setState("redirecting");
    window.location.href = env.CUSTOMER_WEB_URL;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        redirectToCustomerWeb();
        return;
      }

      try {
        let currentUser = user;
        if (!currentUser) {
          currentUser = await authService.getProfile();
          setUser(currentUser);
        }

        const student = await learningService.getStudentProfile();
        if (!student || !isAdmittedStudentStatus(student.status)) {
          redirectToCustomerWeb();
          return;
        }

        const enrollments = await learningService.getMyEnrollments();
        const hasValidEnrollment = enrollments.some((enrollment) =>
          isValidLearningEnrollmentStatus(enrollment.status),
        );

        if (!hasValidEnrollment) {
          redirectToCustomerWeb();
          return;
        }

        if (!cancelled) {
          setState("allowed");
        }
      } catch {
        redirectToCustomerWeb();
      }
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [redirectToCustomerWeb, setUser, user]);

  return { state };
}
