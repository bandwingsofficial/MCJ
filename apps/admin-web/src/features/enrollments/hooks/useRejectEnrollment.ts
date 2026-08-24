"use client";

import { useState } from "react";

import { enrollmentService } from "../services/enrollment.service";

export function useRejectEnrollment() {
  const [isLoading, setIsLoading] = useState(false);

  const rejectEnrollment = async (id: string, reason: string) => {
    setIsLoading(true);

    try {
      return await enrollmentService.rejectEnrollment(id, reason);
    } finally {
      setIsLoading(false);
    }
  };

  return { rejectEnrollment, isLoading };
}
